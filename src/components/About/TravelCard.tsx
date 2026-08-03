import type { TravelLocation } from '../../models/About'
import { thumbUrl } from '../../models/About'
import { TravelGalleryModal } from "./TravelGalleryModal.tsx";
import { useState } from "react";
import { Images } from "lucide-react";

interface Props {
    location: TravelLocation
}

export function TravelCard({ location }: Props) {
    const [showGallery, setShowGallery] = useState(false)
    const images = location.images ?? []
    // Parenthesised: `a ?? 0 > 0` parses as `a ?? (0 > 0)`, which is not the intent.
    const hasImages = images.length > 0

    return (
        <div
            className={`card elev-sm rounded-xl overflow-hidden gap-0! ${
                hasImages ? "cursor-pointer hover:-translate-y-1 transition-transform" : ""
            }`}
            role={hasImages ? 'button' : undefined}
            tabIndex={hasImages ? 0 : undefined}
            aria-label={hasImages ? `View ${images.length} photos of ${location.city}` : undefined}
            onClick={hasImages ? () => setShowGallery(true) : undefined}
            onKeyDown={hasImages ? e => { if (e.key === 'Enter') setShowGallery(true) } : undefined}
        >
            <div className="relative">
                {images[0] ? (
                    <img
                        src={thumbUrl(images[0])}
                        alt={location.city}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-32 object-cover"
                    />
                ) : (
                    <div className="w-full h-32 bg-linear-to-br from-accent-800 to-accent-950" />
                )}
                {images.length > 1 && (
                    <span
                        className="absolute top-2 right-2 tag tag-neutral backdrop-blur-sm"
                        style={{ background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)' }}
                    >
                        <Images size={12} /> {images.length}
                    </span>
                )}
            </div>

            <div className="px-3 py-2">
                <p className="font-semibold text-sm">{location.city}</p>
                <p className="text-xs text-muted">{location.country}{location.year && ` · ${location.year}`}</p>
                {location.note && <p className="text-xs text-muted mt-1 line-clamp-2">{location.note}</p>}
            </div>

            <TravelGalleryModal
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                images={images}
                title={`${location.city}, ${location.country}`}
            />
        </div>
    )
}
