import type { TravelLocation } from '../../models/About'
import { TravelGalleryModal} from "./TravelGalleryModal.tsx";
import {useState} from "react";

interface Props {
    location: TravelLocation
}

export function TravelCard({ location }: Props) {
    const [showGallery, setShowGallery] = useState(false);
    const hasImages = location.images?.length ?? 0 > 0;

    return (
    <div
        className={`card elev-sm rounded-xl overflow-hidden gap-0!
        ${hasImages ? "cursor-pointer hover:-translate-y-1 transition-transform" : ""}`}
        onClick={() => setShowGallery(!showGallery)}
    >
      {location.images?.[0] ? (
        <img src={location.images[0]} alt={location.city} className="w-full h-32 object-cover" />
      ) : (
        <div className="w-full h-32 bg-linear-to-br from-accent-800 to-accent-950" />
      )}
      <div className="px-3 py-2">
        <p className="font-semibold text-sm">{location.city}</p>
        <p className="text-xs text-muted">{location.country}{location.year && ` · ${location.year}`}</p>
        {location.note && <p className="text-xs text-muted mt-1 line-clamp-2">{location.note}</p>}
      </div>
    { hasImages && (
        <TravelGalleryModal
            isOpen={showGallery}
            onClose={() => setShowGallery(false)}
            images={location.images ?? []}
        />
    )}
    </div>

    )
}
