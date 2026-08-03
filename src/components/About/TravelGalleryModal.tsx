import {useCallback, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {ChevronLeft, ChevronRight, X} from "lucide-react";
import type {StoredImage} from "../../models/About";
import {fullUrl, thumbUrl} from "../../models/About";

interface TravelGalleryProps {
    images: StoredImage[];
    isOpen: boolean;
    onClose: () => void;
    /** Shown in the overlay chrome, e.g. "Kyoto, Japan". */
    title?: string;
}

/**
 * Thin wrapper so the overlay mounts fresh on each open — that resets the slide
 * index without a setState-in-effect, which cascades renders.
 */
export function TravelGalleryModal({images, isOpen, onClose, title}: TravelGalleryProps) {
    if (!isOpen || images.length === 0) return null
    return <GalleryOverlay images={images} onClose={onClose} title={title} />
}

const SWIPE_THRESHOLD = 50

function GalleryOverlay({images, onClose, title}: { images: StoredImage[], onClose: () => void, title?: string }) {
    const [index, setIndex] = useState(0)
    const [loaded, setLoaded] = useState<Record<number, boolean>>({})
    const [touchStart, setTouchStart] = useState<number | null>(null)

    const many = images.length > 1

    const next = useCallback(() => setIndex(i => (i + 1) % images.length), [images.length])
    const prev = useCallback(() => setIndex(i => (i - 1 + images.length) % images.length), [images.length])

    // Lock scroll behind the overlay.
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') next()
            if (e.key === 'ArrowLeft') prev()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [next, prev, onClose])

    // Warm the neighbours so arrowing through doesn't flash a spinner.
    useEffect(() => {
        const neighbours = [(index + 1) % images.length, (index - 1 + images.length) % images.length]
        for (const i of neighbours) {
            const img = new Image()
            img.src = fullUrl(images[i])
        }
    }, [index, images])

    function onTouchEnd(endX: number) {
        if (touchStart === null) return
        const delta = touchStart - endX
        if (Math.abs(delta) > SWIPE_THRESHOLD) {
            if (delta > 0) next()
            else prev()
        }
        setTouchStart(null)
    }

    const chromeButton = "flex items-center justify-center rounded-full cursor-pointer transition-colors backdrop-blur-sm"
    const chromeStyle = {
        background: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
        border: '1px solid var(--color-divider)',
        color: 'var(--color-text)',
    }

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title ? `${title} photo gallery` : 'Photo gallery'}
            className="fixed inset-0 z-50 flex flex-col"
            style={{background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)', backdropFilter: 'blur(12px)'}}
            onClick={onClose}
        >
            {/* Top chrome */}
            <div
                className="flex items-center justify-between gap-4 px-5 py-4 shrink-0"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 min-w-0">
                    {title && <span className="font-heading font-semibold truncate">{title}</span>}
                    {many && <span className="tag tag-neutral shrink-0">{index + 1} / {images.length}</span>}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close gallery"
                    className={`${chromeButton} w-9 h-9 shrink-0 hover:text-accent-400`}
                    style={chromeStyle}
                >
                    <X size={18}/>
                </button>
            </div>

            {/* Stage */}
            <div
                className="relative flex-1 flex items-center justify-center px-4 min-h-0"
                onClick={e => e.stopPropagation()}
                onTouchStart={e => setTouchStart(e.touches[0].clientX)}
                onTouchEnd={e => onTouchEnd(e.changedTouches[0].clientX)}
            >
                {!loaded[index] && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin"/>
                    </div>
                )}

                <img
                    key={fullUrl(images[index])}
                    src={fullUrl(images[index])}
                    alt={title ? `${title} — photo ${index + 1} of ${images.length}` : `Photo ${index + 1} of ${images.length}`}
                    fetchPriority="high"
                    decoding="async"
                    onLoad={() => setLoaded(prev => ({...prev, [index]: true}))}
                    className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-200 ${
                        loaded[index] ? 'opacity-100' : 'opacity-0'
                    }`}
                />

                {many && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Previous photo"
                            className={`${chromeButton} absolute left-4 w-11 h-11 hover:text-accent-400`}
                            style={chromeStyle}
                        >
                            <ChevronLeft size={22}/>
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next photo"
                            className={`${chromeButton} absolute right-4 w-11 h-11 hover:text-accent-400`}
                            style={chromeStyle}
                        >
                            <ChevronRight size={22}/>
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {many && (
                <div
                    className="shrink-0 flex gap-2 overflow-x-auto px-5 py-4 justify-start sm:justify-center"
                    onClick={e => e.stopPropagation()}
                >
                    {images.map((image, i) => (
                        <button
                            key={fullUrl(image)}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Go to photo ${i + 1}`}
                            aria-current={i === index}
                            className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                i === index ? 'ring-2 ring-accent-400' : 'opacity-45 hover:opacity-90'
                            }`}
                        >
                            <img
                                src={thumbUrl(image)}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>,
        document.body
    )
}
