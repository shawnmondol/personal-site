import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { TravelLocation } from '../../models/About'
import { useState } from "react"
import { TravelGalleryModal } from "./TravelGalleryModal.tsx"
import { useTheme } from '../../context/ThemeContext'
import { themes } from '../../models/themes'

interface Props {
  visited: TravelLocation[]
  wishlist: TravelLocation[]
}

export function TravelMap({ visited, wishlist }: Props) {
  const [showGallery, setShowGallery] = useState(false);
  const { theme } = useTheme()
  const accent500 = themes[theme].vars['--theme-300']
  const accent600 = themes[theme].vars['--theme-400']

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      className="w-full h-120 rounded-xl z-0"
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
          pathOptions={{ color: accent600, fillColor: accent500, fillOpacity: 0.9, weight: 2 }}
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
              <TravelGalleryModal images={loc.images!} isOpen={showGallery} onClose={() => setShowGallery(false)}/>
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
