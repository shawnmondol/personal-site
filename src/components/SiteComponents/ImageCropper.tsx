import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import type {CropRect} from "../../services/images/resizeImage.ts";

interface Props {
    /** The freshly picked file. Cropping happens before anything is uploaded. */
    file: File
    onCancel: () => void
    onConfirm: (crop: CropRect) => void
    title?: string
    confirmLabel?: string
    /** Keeps the dialog open, and controls locked, while the upload runs. */
    busy?: boolean
}

/** The first entry is the default framing, so it should match where the image lands. */
const ASPECTS = [
    {label: 'Cover', value: 21 / 9},
    {label: '16:9', value: 16 / 9},
    {label: '3:2', value: 3 / 2},
    {label: 'Square', value: 1},
]

const MAX_ZOOM = 4

function clampZoom(zoom: number) {
    return Math.min(MAX_ZOOM, Math.max(1, zoom))
}

/**
 * Pan-and-zoom cropper: the frame is fixed and the image moves behind it, so the
 * result always fills the chosen aspect ratio. Position is held as the point of
 * the image sitting at the frame's centre — a fraction, not pixels — so zooming
 * and resizing keep whatever the user framed.
 */
export function ImageCropper({file, onCancel, onConfirm, title = 'Crop image', confirmLabel = 'Use image', busy = false}: Props) {
    const [natural, setNatural] = useState<{ w: number, h: number } | null>(null)
    const [failed, setFailed] = useState(false)
    const [aspect, setAspect] = useState(ASPECTS[0].value)
    const [zoom, setZoom] = useState(1)
    const [focus, setFocus] = useState({x: 0.5, y: 0.5})
    const [stage, setStage] = useState({w: 0, h: 0})

    const stageRef = useRef<HTMLDivElement>(null)
    const dragRef = useRef<{ pointerX: number, pointerY: number, x: number, y: number } | null>(null)

    /**
     * The preview is an object URL, which has to be released once the picked file is
     * gone. Handing it to the element through the ref ties the URL's lifetime to the
     * element itself: nothing leaks, and a remount re-issues a live one.
     */
    const attachPreview = useCallback((node: HTMLImageElement | null) => {
        if (!node) return
        const objectUrl = URL.createObjectURL(file)
        node.src = objectUrl
        return () => URL.revokeObjectURL(objectUrl)
    }, [file])

    // Lock scroll behind the dialog.
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && !busy) onCancel()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onCancel, busy])

    useLayoutEffect(() => {
        const el = stageRef.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => {
            setStage({w: entry.contentRect.width, h: entry.contentRect.height})
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    // The crop frame is the largest box of the chosen ratio that fits the stage.
    const frameW = Math.min(stage.w, stage.h * aspect)
    const frameH = frameW / aspect

    // At zoom 1 the image exactly covers the frame; beyond that it overflows and pans.
    const cover = natural && frameW > 0 ? Math.max(frameW / natural.w, frameH / natural.h) : 0
    const width = natural ? natural.w * cover * zoom : 0
    const height = natural ? natural.h * cover * zoom : 0

    /** Keeps the frame inside the image: the focus point can't approach an edge closer than half a frame. */
    function clampFocus(next: { x: number, y: number }) {
        const halfX = width > 0 ? Math.min(0.5, frameW / (2 * width)) : 0.5
        const halfY = height > 0 ? Math.min(0.5, frameH / (2 * height)) : 0.5
        return {
            x: Math.min(1 - halfX, Math.max(halfX, next.x)),
            y: Math.min(1 - halfY, Math.max(halfY, next.y)),
        }
    }

    const framed = clampFocus(focus)
    const left = frameW / 2 - framed.x * width
    const top = frameH / 2 - framed.y * height
    const ready = natural !== null && frameW > 0

    function startDrag(e: React.PointerEvent) {
        if (busy || !ready) return
        e.currentTarget.setPointerCapture(e.pointerId)
        dragRef.current = {pointerX: e.clientX, pointerY: e.clientY, x: framed.x, y: framed.y}
    }

    function drag(e: React.PointerEvent) {
        const start = dragRef.current
        if (!start) return
        setFocus(clampFocus({
            x: start.x - (e.clientX - start.pointerX) / width,
            y: start.y - (e.clientY - start.pointerY) / height,
        }))
    }

    function endDrag(e: React.PointerEvent) {
        if (dragRef.current) e.currentTarget.releasePointerCapture(e.pointerId)
        dragRef.current = null
    }

    function reset() {
        setZoom(1)
        setFocus({x: 0.5, y: 0.5})
    }

    function confirm() {
        if (!natural || !ready) return
        // Display pixels back to source pixels.
        const ratio = natural.w / width
        onConfirm({
            x: -left * ratio,
            y: -top * ratio,
            width: frameW * ratio,
            height: frameH * ratio,
        })
    }

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)', backdropFilter: 'blur(10px)'}}
        >
            <div
                className="w-full max-w-[880px] rounded-xl shadow-2xl flex flex-col overflow-hidden"
                style={{background: 'var(--color-surface)', border: '1px solid var(--color-divider)'}}
            >
                <div className="flex items-baseline justify-between gap-4 px-6 pt-5 pb-4">
                    <h2 className="text-[18px] font-semibold">{title}</h2>
                    <span className="text-xs text-muted">Drag to reposition · scroll to zoom</span>
                </div>

                {/* Stage */}
                <div
                    ref={stageRef}
                    className="relative flex items-center justify-center px-6"
                    style={{height: 'min(52vh, 460px)'}}
                >
                    {failed ? (
                        <p className="text-sm text-muted">That file couldn't be opened as an image.</p>
                    ) : (
                        <div
                            className="relative overflow-hidden rounded-[10px] touch-none select-none"
                            style={{
                                width: frameW || 0,
                                height: frameH || 0,
                                border: '1px solid var(--color-divider)',
                                cursor: busy ? 'progress' : 'grab',
                            }}
                            onPointerDown={startDrag}
                            onPointerMove={drag}
                            onPointerUp={endDrag}
                            onPointerCancel={endDrag}
                            onWheel={e => !busy && setZoom(z => clampZoom(z * (1 - e.deltaY / 600)))}
                        >
                            <img
                                ref={attachPreview}
                                alt=""
                                draggable={false}
                                onLoad={e => setNatural({
                                    w: e.currentTarget.naturalWidth,
                                    h: e.currentTarget.naturalHeight,
                                })}
                                onError={() => setFailed(true)}
                                className="absolute max-w-none"
                                style={{left, top, width, height}}
                            />

                            {/* Rule-of-thirds guides, drawn over the image rather than around it. */}
                            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                                {Array.from({length: 9}, (_, i) => (
                                    <div key={i} style={{boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.28)'}} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-6 pt-5">
                    <div className="flex items-center gap-1.5">
                        {ASPECTS.map(option => (
                            <button
                                key={option.label}
                                type="button"
                                disabled={busy}
                                onClick={() => setAspect(option.value)}
                                aria-pressed={aspect === option.value}
                                className={`tag ${aspect === option.value ? 'tag-accent' : 'tag-neutral'} cursor-pointer disabled:opacity-50`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <label className="flex items-center gap-3 flex-1 min-w-[180px]">
                        <span className="text-xs uppercase tracking-wider text-muted">Zoom</span>
                        <input
                            type="range"
                            min={1}
                            max={MAX_ZOOM}
                            step={0.01}
                            value={zoom}
                            disabled={busy || !ready}
                            onChange={e => setZoom(clampZoom(Number(e.target.value)))}
                            className="flex-1 cursor-pointer disabled:opacity-50"
                            style={{accentColor: 'var(--color-accent)'}}
                        />
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 pb-5 pt-4">
                    <button type="button" onClick={reset} disabled={busy} className="btn btn-danger mr-auto">
                        Reset
                    </button>
                    <button type="button" onClick={onCancel} disabled={busy} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="button" onClick={confirm} disabled={busy || !ready} className="btn btn-primary">
                        {busy ? 'Uploading…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
