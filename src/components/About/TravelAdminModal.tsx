import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { PopupModal } from '../SiteComponents/PopupModal'
import { Button } from '../SiteComponents/Button'
import {
  addImagesToLocation,
  makeLocation,
  removeImageFromLocation,
  saveAboutData,
  searchLocations,
} from '../../services/about/firestoreAboutService'
import type { LocationSuggestion } from '../../services/about/firestoreAboutService'
import type { AboutData, TravelLocation } from '../../models/About'

interface Props {
  isOpen: boolean
  onClose: () => void
  data: AboutData
  onChange: (updated: AboutData) => void
}

type Tab = 'visited' | 'wishlist'

export function TravelAdminModal({ isOpen, onClose, data, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('visited')

  // Search state
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<LocationSuggestion | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Extra fields
  const [year, setYear] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Expanded location for image management
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const locations: TravelLocation[] = tab === 'visited' ? data.visited : data.wishlist

  useEffect(() => {
    if (selected) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setSuggestions([]); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchLocations(query)
        setSuggestions(results)
        setShowDropdown(true)
      } finally {
        setSearching(false)
      }
    }, 350)
  }, [query, selected])

  function handleSelect(s: LocationSuggestion) {
    setSelected(s)
    setQuery(s.displayName)
    setShowDropdown(false)
    setSuggestions([])
  }

  function handleClear() {
    setSelected(null)
    setQuery('')
    setYear('')
    setNote('')
    setSuggestions([])
  }

  async function handleAdd() {
    if (!selected) { toast.error('Select a location first'); return }
    setSaving(true)
    try {
      const loc = makeLocation(selected.city, selected.country, selected, {
        year: tab === 'visited' && year ? parseInt(year) : undefined,
        note: note.trim() || undefined,
      })
      const updated: AboutData = { ...data, [tab]: [...locations, loc] }
      await saveAboutData(updated)
      onChange(updated)
      handleClear()
      toast.success(`Added ${loc.city}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id: string) {
    const updated: AboutData = { ...data, [tab]: locations.filter((l) => l.id !== id) }
    await saveAboutData(updated)
    onChange(updated)
    if (expandedId === id) setExpandedId(null)
    const loc = locations.find(l => l.id === id)
    toast.success(`Removed ${loc?.city}`)
  }

  async function handleImageUpload(locationId: string, files: FileList) {
    if (!files.length) return
    setUploadingId(locationId)
    try {
      const updated = await addImagesToLocation(data, tab, locationId, Array.from(files))
      onChange(updated)
      toast.success(`Added ${files.length} image${files.length > 1 ? 's' : ''}`)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingId(null)
    }
  }

  async function handleImageRemove(locationId: string, imageUrl: string) {
    try {
      const updated = await removeImageFromLocation(data, tab, locationId, imageUrl)
      onChange(updated)
    } catch {
      toast.error('Failed to remove image')
    }
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors cursor-pointer ${
      tab === t ? 'border-accent-600 text-accent-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  return (
    <PopupModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Edit Travel</h2>

      <div className="flex gap-2 border-b mb-6">
        <button className={tabClass('visited')} onClick={() => { setTab('visited'); handleClear(); setExpandedId(null) }}>Visited</button>
        <button className={tabClass('wishlist')} onClick={() => { setTab('wishlist'); handleClear(); setExpandedId(null) }}>Wishlist</button>
      </div>

      {/* Location search */}
      <div className="relative mb-3">
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm pr-16"
          placeholder="Search for a city or place…"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null) }}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-gray-400">
          {searching && <span>Searching…</span>}
          {selected && (
            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
          )}
        </div>
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="px-3 py-2.5 text-sm hover:bg-accent-50 cursor-pointer border-b last:border-0"
                onMouseDown={() => handleSelect(s)}
              >
                <span className="font-medium">{s.city}</span>
                <span className="text-gray-500 ml-1 text-xs truncate block">{s.displayName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {tab === 'visited' && (
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Year (optional)"
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
            />
          )}
          <input
            className="border rounded-lg px-3 py-2 text-sm col-span-2"
            placeholder="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>
      )}

      <Button onClick={handleAdd} disabled={!selected || saving} className="mb-6 w-full">
        {saving ? 'Saving…' : 'Add'}
      </Button>

      {/* Existing locations */}
      <ul className="space-y-2 max-h-90 overflow-y-auto">
        {locations.length === 0 && (
          <li className="text-sm text-gray-400 text-center py-4">No locations yet</li>
        )}
        {locations.map((loc) => (
          <li key={loc.id} className="bg-gray-50 rounded-lg overflow-hidden">
            {/* Location row */}
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <button
                className="flex items-center gap-2 text-left flex-1 cursor-pointer"
                onClick={() => setExpandedId(expandedId === loc.id ? null : loc.id)}
              >
                <span className="font-medium">{loc.city}</span>
                <span className="text-gray-500">, {loc.country}</span>
                {loc.year && <span className="text-gray-400">({loc.year})</span>}
                {loc.images?.length ? (
                  <span className="text-xs text-accent-500 ml-1">{loc.images.length} photo{loc.images.length > 1 ? 's' : ''}</span>
                ) : null}
                <span className="text-gray-400 ml-auto text-xs">{expandedId === loc.id ? '▲' : '▼'}</span>
              </button>
              <button
                onClick={() => handleRemove(loc.id)}
                className="text-red-400 hover:text-red-600 text-xs cursor-pointer transition-colors ml-3"
              >
                Remove
              </button>
            </div>

            {/* Expanded image manager */}
            {expandedId === loc.id && (
              <div className="px-3 pb-3 border-t border-gray-200 pt-3">
                {/* Thumbnail grid */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(loc.images ?? []).map((url) => (
                    <div key={url} className="relative group w-20 h-20">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        onClick={() => handleImageRemove(loc.id, url)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {!(loc.images?.length) && (
                    <p className="text-xs text-gray-400">No photos yet</p>
                  )}
                </div>

                {/* Upload button */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && handleImageUpload(loc.id, e.target.files)}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingId === loc.id}
                  className="text-xs px-3 py-1.5 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadingId === loc.id ? 'Uploading…' : 'Upload Photos'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </PopupModal>
  )
}
