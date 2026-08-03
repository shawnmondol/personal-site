import {useEffect, useRef, useState} from "react"
import {Palette} from "lucide-react"
import {useTheme, type Theme} from "../../context/ThemeContext.tsx"
import {themes} from "../../models/themes.ts"

export function ThemePicker({className = ''}: { className?: string }) {
    const {theme, setTheme} = useTheme()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const entries = (Object.entries(themes) as [Theme, typeof themes[Theme]][])
        .map(([value, {label, dot}]) => ({value, label, dot}))

    useEffect(() => {
        if (!open) return
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [open])

    return (
        <div ref={ref} className={`relative flex items-center ${className}`}>
            <button
                type="button"
                aria-label="Change accent colour"
                title="Change accent colour"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors"
                style={{color: open ? 'var(--color-accent)' : 'var(--muted-55)'}}
            >
                <Palette size={17}/>
                <span
                    className="w-3 h-3 rounded-full border"
                    style={{background: 'var(--color-accent)', borderColor: 'var(--color-divider)'}}
                />
            </button>

            <div
                className={`absolute right-0 top-full mt-2 z-40 transition-all duration-200 ${
                    open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
                }`}
            >
                <div
                    className="flex items-center gap-2 rounded-xl p-2.5 elev-sm"
                    style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-divider)',
                    }}
                >
                    {entries.map(t => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setTheme(t.value)}
                            title={t.label}
                            aria-label={t.label}
                            aria-pressed={theme === t.value}
                            className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-transform ${t.dot} ${
                                theme === t.value ? 'scale-110' : 'opacity-55 hover:opacity-100 border-transparent!'
                            }`}
                            style={theme === t.value ? {borderColor: 'var(--color-text)'} : undefined}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
