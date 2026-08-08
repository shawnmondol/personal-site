import {useRef, useState} from "react";
import {toast} from "sonner";
import type {ProjectCover} from "../../models/Project.ts";
import {DEFAULT_COVER_HEIGHT} from "../../models/Project.ts";
import type {CropRect} from "../../services/images/resizeImage.ts";
import {deleteProjectCover, uploadProjectCover} from "../../services/projects/firestoreProjectService.ts";
import {ImageCropper} from "../SiteComponents/ImageCropper.tsx";

interface Props {
    cover?: ProjectCover
    projectId: string
    editMode?: boolean
    onChange?: (cover: ProjectCover | undefined) => void
}

/** The project hero. Visitors see nothing when a project has no cover yet. */
export function ProjectCoverImage({cover, projectId, editMode = false, onChange}: Props) {
    const [uploading, setUploading] = useState(false)
    /** Held locally until the crop is confirmed — nothing reaches Storage before then. */
    const [pending, setPending] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!cover && !editMode) return null

    async function handleCrop(crop: CropRect) {
        if (!pending) return
        setUploading(true)
        try {
            const uploaded = await uploadProjectCover(pending, projectId, crop)
            // The replaced render is unreachable once state moves on — drop it now.
            void deleteProjectCover(cover)
            onChange?.(uploaded)
            setPending(null)
        } catch (error) {
            console.error(error)
            toast.error('Cover upload failed')
        } finally {
            setUploading(false)
        }
    }

    function remove() {
        void deleteProjectCover(cover)
        onChange?.(undefined)
    }

    return (
        <section className="mt-8">
            {cover ? (
                <div className="relative group/cover">
                    <img
                        src={cover.url}
                        alt=""
                        className="w-full object-cover rounded-[14px] border"
                        style={{
                            borderColor: 'var(--color-divider)',
                            // Covers cropped to a ratio render it exactly; older ones keep the fixed hero.
                            aspectRatio: cover.aspect,
                            height: cover.aspect ? undefined : DEFAULT_COVER_HEIGHT,
                        }}
                    />
                    {editMode && (
                        <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-[14px] bg-black/50 opacity-0 group-hover/cover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                disabled={uploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="btn btn-primary"
                            >
                                {uploading ? 'Uploading…' : 'Replace cover'}
                            </button>
                            <button type="button" onClick={remove} className="btn btn-secondary">Remove</button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-[220px] border border-dashed rounded-[14px] text-sm text-muted hover:border-accent-400 hover:text-accent-400 cursor-pointer transition-colors disabled:opacity-50"
                    style={{borderColor: 'var(--color-divider)'}}
                >
                    {uploading ? 'Uploading…' : 'Add a cover image — it heads this page and its card'}
                </button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) setPending(file)
                }}
            />

            {pending && (
                <ImageCropper
                    key={`${pending.name}-${pending.lastModified}`}
                    file={pending}
                    busy={uploading}
                    title="Crop cover image"
                    confirmLabel="Set cover"
                    onCancel={() => setPending(null)}
                    onConfirm={crop => void handleCrop(crop)}
                />
            )}
        </section>
    )
}
