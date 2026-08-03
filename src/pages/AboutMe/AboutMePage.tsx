import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.tsx'
import { getAboutData } from '../../services/about/firestoreAboutService.ts'
import { TravelMap } from '../../components/About/TravelMap.tsx'
import { TravelAdminModal } from '../../components/About/TravelAdminModal.tsx'
import { TravelCard } from '../../components/About/TravelCard.tsx'
import { Loading } from '../../components/SiteComponents/Loading.tsx'
import type { AboutData } from '../../models/About.ts'

const EMPTY: AboutData = { hobbies: [], visited: [], wishlist: [] }

export function AboutMePage() {
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
    <div className="page-shell">
      <section style={{ padding: '80px 0 8px' }}>
        <h1>About Me</h1>
        <p className="text-subtle text-base leading-relaxed max-w-[56ch] mt-4">
          My hobbies, places I've been, and places I want to go.
        </p>
      </section>

      <section style={{ padding: '40px 0' }}>
        <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
          <h2>Travel</h2>
          <div className="flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--color-accent)' }} />
              Visited
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--color-neutral-500)' }} />
              Wishlist
            </span>
          </div>
        </div>

        <div className="rounded-[14px] overflow-hidden" style={{ border: '1px solid var(--color-divider)' }}>
          <TravelMap visited={resolved.visited} wishlist={resolved.wishlist} />
        </div>

        {resolved.visited.length === 0 && resolved.wishlist.length === 0 && (
          <p className="text-muted text-[13px] mt-4">
            No trips logged yet — visited cities, a wishlist, and hobbies populate below once added.
          </p>
        )}
      </section>

      {resolved.visited.length > 0 && (
        <section className="section-rule" style={{ padding: '40px 0' }}>
          <h2 className="mb-4">Places I've Been</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {resolved.visited.map((loc) => (
              <TravelCard key={loc.id} location={loc} />
            ))}
          </div>
        </section>
      )}

      {resolved.wishlist.length > 0 && (
        <section className="section-rule" style={{ padding: '40px 0' }}>
          <h2 className="mb-4">Places I Want to Go</h2>
          <div className="flex flex-wrap gap-2">
            {resolved.wishlist.map((loc) => (
              <span key={loc.id} className="tag tag-neutral border-dashed!">
                {loc.city}, {loc.country}
              </span>
            ))}
          </div>
        </section>
      )}

      {resolved.hobbies.length > 0 && (
        <section className="section-rule" style={{ padding: '40px 0' }}>
          <h2 className="mb-4">Hobbies</h2>
          <div className="flex flex-wrap gap-2">
            {resolved.hobbies.map((h) => (
              <span key={h} className="tag tag-neutral">{h}</span>
            ))}
          </div>
        </section>
      )}

      {isAdmin && (
        <div className="pb-16 pt-6">
          <button
            onClick={() => setShowAdmin(true)}
            className="text-sm text-muted hover:text-accent-400 cursor-pointer transition-colors"
          >
            Edit Travel
          </button>
        </div>
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
