import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, app } from '../auth/firebaseService'
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from 'firebase/storage'
import type { AboutData, StoredImage, TravelImage, TravelLocation } from '../../models/About'
import { fullUrl, thumbUrl } from '../../models/About'
import { resizeForGallery } from '../images/resizeImage'

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

/** Paths are timestamped, so every object is immutable and safe to cache forever. */
const IMAGE_METADATA = { cacheControl: 'public, max-age=31536000, immutable' }

function baseName(file: File): string {
  return file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-')
}

/** Uploads a downscaled display image plus a thumbnail, and returns both URLs. */
async function uploadTravelImage(file: File, locationId: string): Promise<TravelImage> {
  const { full, thumb } = await resizeForGallery(file)
  const stem = `travel/${locationId}/${Date.now()}-${baseName(file)}`

  const [url, thumbDownloadUrl] = await Promise.all([
    uploadBytes(ref(storage, `${stem}.${full.ext}`), full.blob, {
      ...IMAGE_METADATA,
      contentType: full.blob.type || file.type,
    }).then(snap => getDownloadURL(snap.ref)),
    uploadBytes(ref(storage, `${stem}-thumb.${thumb.ext}`), thumb.blob, {
      ...IMAGE_METADATA,
      contentType: thumb.blob.type || file.type,
    }).then(snap => getDownloadURL(snap.ref)),
  ])

  return { url, thumb: thumbDownloadUrl }
}

export async function addImagesToLocation(
  data: AboutData,
  tab: 'visited' | 'wishlist',
  locationId: string,
  files: File[]
): Promise<AboutData> {
  const uploaded: StoredImage[] = await Promise.all(files.map((f) => uploadTravelImage(f, locationId)))
  const updated: AboutData = {
    ...data,
    [tab]: data[tab].map((loc) =>
      loc.id === locationId ? { ...loc, images: [...(loc.images ?? []), ...uploaded] } : loc
    ),
  }
  await saveAboutData(updated)
  return updated
}

async function deleteIfPresent(url?: string) {
  if (!url) return
  try {
    await deleteObject(ref(storage, url))
  } catch {
    // Storage file may already be gone; continue
  }
}

export async function removeImageFromLocation(
  data: AboutData,
  tab: 'visited' | 'wishlist',
  locationId: string,
  imageUrl: string
): Promise<AboutData> {
  const location = data[tab].find((loc) => loc.id === locationId)
  const target = (location?.images ?? []).find((img) => fullUrl(img) === imageUrl)

  // Remove the thumbnail too, or it is orphaned in Storage forever.
  if (target) {
    const thumb = thumbUrl(target)
    await Promise.all([deleteIfPresent(imageUrl), thumb === imageUrl ? undefined : deleteIfPresent(thumb)])
  } else {
    await deleteIfPresent(imageUrl)
  }

  const updated: AboutData = {
    ...data,
    [tab]: data[tab].map((loc) =>
      loc.id === locationId
        ? { ...loc, images: (loc.images ?? []).filter((img) => fullUrl(img) !== imageUrl) }
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
