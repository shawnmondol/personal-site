import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { TravelLocation } from '../../models/About'
import {useState} from "react";
import {TravelGalleryModal} from "./TravelGalleryModal.tsx";

interface Props {
  visited: TravelLocation[]
  wishlist: TravelLocation[]
}

export function TravelMap({ visited, wishlist }: Props) {
  const [showGallery, setShowGallery] = useState(false);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      className="w-full h-[480px] rounded-xl z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {visited.map((loc) => (
        <CircleMarker
          key={loc.id}
          center={[loc.lat, loc.lng]}
          radius={7}
          pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 2 }}
        >
          <Popup>
            <div className="text-sm w-40">
              {loc.images?.[0] && (
                <img src={loc.images[0]} alt={loc.city} className="w-full h-24 object-cover rounded mb-2 cursor-pointer"
                     onClick={()=>setShowGallery(true)}
                />
              )}
              <p className="font-semibold">{loc.city}, {loc.country}</p>
              {loc.year && <p className="text-gray-500">{loc.year}</p>}
              {loc.note && <p className="mt-1 text-gray-600">{loc.note}</p>}
              {(loc.images?.length ?? 0) > 1 && (
                <p className="text-xs text-gray-400 mt-1">{loc.images!.length} photos</p>
              )}
            </div>
            { (loc.images?.length ?? 0 > 0) && (
              <TravelGalleryModal images={loc.images} isOpen={showGallery} onClose={() => setShowGallery(false)}/>
            )}
          </Popup>
        </CircleMarker>
      ))}

      {wishlist.map((loc) => (
        <CircleMarker
          key={loc.id}
          center={[loc.lat, loc.lng]}
          radius={7}
          pathOptions={{ color: '#9ca3af', fillColor: '#e5e7eb', fillOpacity: 0.8, weight: 2, dashArray: '4 2' }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{loc.city}, {loc.country}</p>
              <p className="text-gray-400 italic">On the wishlist</p>
              {loc.note && <p className="mt-1">{loc.note}</p>}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
