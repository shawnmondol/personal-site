/** A stored gallery photo: a display-sized image plus a small thumbnail. */
export interface TravelImage {
  url: string
  thumb?: string
}

/**
 * Photos uploaded before the resize pipeline are bare URL strings. Both shapes are
 * readable, so existing data keeps working without a migration — run the backfill
 * script to give them thumbnails.
 */
export type StoredImage = string | TravelImage

export function fullUrl(image: StoredImage): string {
  return typeof image === 'string' ? image : image.url
}

export function thumbUrl(image: StoredImage): string {
  return typeof image === 'string' ? image : image.thumb ?? image.url
}

export interface TravelLocation {
  id: string
  city: string
  country: string
  lat: number
  lng: number
  year?: number
  note?: string
  images?: StoredImage[]
}

export interface AboutData {
  hobbies: string[]
  visited: TravelLocation[]
  wishlist: TravelLocation[]
}
