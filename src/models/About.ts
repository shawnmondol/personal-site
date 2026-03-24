export interface TravelLocation {
  id: string
  city: string
  country: string
  lat: number
  lng: number
  year?: number
  note?: string
  images?: string[]
}

export interface AboutData {
  hobbies: string[]
  visited: TravelLocation[]
  wishlist: TravelLocation[]
}
