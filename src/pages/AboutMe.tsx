import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAboutData } from '../services/about/firestoreAboutService'
import { TravelMap } from '../components/About/TravelMap'
import { TravelAdminModal } from '../components/About/TravelAdminModal'
import { TravelCard } from '../components/About/TravelCard'
import { Loading } from '../components/SiteComponents/Loading'
import type { AboutData } from '../models/About'

const EMPTY: AboutData = { hobbies: [], visited: [], wishlist: [] }

export function AboutMe() {
  const { user } = useAuth()
  const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID

  const [data, setData] = useState<AboutData | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    getAboutData().then(setData)
  }, [])

  if (!data) return <Loading />

  const resolved = data ?? EMPTY

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">About Me</h1>
          <p className="mt-4 text-gray-300 leading-relaxed max-w-2xl">
            My hobbies, places I've been, and places I want to go
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-14">
        {/* Travel map */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Travel</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-accent-300 border border-accent-400" />
                Visited
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-300 border border-gray-400" />
                Wishlist
              </span>
            </div>
          </div>

          <TravelMap visited={resolved.visited} wishlist={resolved.wishlist} />
        </section>

        {/* Visited list */}
        {resolved.visited.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Places I've Been</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {resolved.visited.map((loc) => (
                <TravelCard key={loc.id} location={loc} />
              ))}
            </div>
          </section>
        )}

        {/* Wishlist */}
        {resolved.wishlist.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Places I Want to Go</h3>
            <div className="flex flex-wrap gap-2">
              {resolved.wishlist.map((loc) => (
                <span
                  key={loc.id}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full border border-gray-300 border-dashed"
                >
                  {loc.city}, {loc.country}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Hobbies */}
        {resolved.hobbies.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Hobbies</h3>
            <div className="flex flex-wrap gap-2">
              {resolved.hobbies.map((h) => (
                <span key={h} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200">
                  {h}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>

      {isAdmin && (
        <footer className="text-center pb-10">
          <button
            onClick={() => setShowAdmin(true)}
            className="text-sm text-gray-400 hover:text-accent-500 cursor-pointer transition-colors"
          >
            Edit Travel
          </button>
        </footer>
      )}

      <TravelAdminModal
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        data={resolved}
        onChange={setData}
      />
    </div>
  )
}
