import { createContext, useContext, useEffect, useState } from "react"
import { themes, type Theme } from "../models/themes.ts"

export type { Theme }

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'site-theme'

function applyTheme(theme: Theme) {
    const root = document.documentElement
    for (const [key, value] of Object.entries(themes[theme].vars)) {
        root.style.setProperty(key, value)
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme
        return stored && stored in themes ? stored : 'blue'
    })

    useEffect(() => {
        applyTheme(theme)
        localStorage.setItem(STORAGE_KEY, theme)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
    return ctx
}
