import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, app } from '../auth/firebaseService'
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from 'firebase/storage'
import type { AboutData, TravelLocation } from '../../models/About'

const storage = getStorage(app)

const ABOUT_DOC = doc(db, 'about', 'profile')

const EMPTY: AboutData = { hobbies: [], visited: [], wishlist: [] }

export async function getAboutData(): Promise<AboutData> {
  const snap = await getDoc(ABOUT_DOC)
  return snap.exists() ? (snap.data() as AboutData) : EMPTY
}

export async function saveAboutData(data: AboutData): Promise<void> {
  await setDoc(ABOUT_DOC, data)
}

export interface LocationSuggestion {
  displayName: string
  city: string
  country: string
  lat: number
  lng: number
}

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query.trim()) return []
  const q = encodeURIComponent(query)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=6&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const results = await res.json()
  return results.map((r: any) => {
    const addr = r.address ?? {}
    const city =
      addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.county ?? query
    const country = addr.country ?? ''
    return {
      displayName: r.display_name,
      city,
      country,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }
  })
}

async function uploadTravelImage(file: File, locationId: string): Promise<string> {
  const storageRef = ref(storage, `travel/${locationId}/${Date.now()}-${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}

export async function addImagesToLocation(
  data: AboutData,
  tab: 'visited' | 'wishlist',
  locationId: string,
  files: File[]
): Promise<AboutData> {
  const urls = await Promise.all(files.map((f) => uploadTravelImage(f, locationId)))
  const updated: AboutData = {
    ...data,
    [tab]: data[tab].map((loc) =>
      loc.id === locationId ? { ...loc, images: [...(loc.images ?? []), ...urls] } : loc
    ),
  }
  await saveAboutData(updated)
  return updated
}

export async function removeImageFromLocation(
  data: AboutData,
  tab: 'visited' | 'wishlist',
  locationId: string,
  imageUrl: string
): Promise<AboutData> {
  try {
    await deleteObject(ref(storage, imageUrl))
  } catch {
    // Storage file may already be gone; continue
  }
  const updated: AboutData = {
    ...data,
    [tab]: data[tab].map((loc) =>
      loc.id === locationId
        ? { ...loc, images: (loc.images ?? []).filter((u) => u !== imageUrl) }
        : loc
    ),
  }
  await saveAboutData(updated)
  return updated
}

export function makeLocation(
  city: string,
  country: string,
  coords: { lat: number; lng: number },
  extra?: Pick<TravelLocation, 'year' | 'note'>
): TravelLocation {
  const loc: TravelLocation = {
    id: `${city}-${country}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-'),
    city,
    country,
    lat: coords.lat,
    lng: coords.lng,
  }
  if (extra?.year !== undefined) loc.year = extra.year
  if (extra?.note !== undefined) loc.note = extra.note
  return loc
}
