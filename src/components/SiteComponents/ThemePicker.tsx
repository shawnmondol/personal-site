import { useTheme, type Theme } from "../../context/ThemeContext.tsx"
import { themes } from "../../models/themes.ts"
import {Palette} from "lucide-react";

export function ThemePicker({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();

    const THEMES = (Object.entries(themes) as [Theme, typeof themes[Theme]][])
        .map(([value, { label, dot }]) => ({ value, label, dot }))

    return (
        <div className={`flex items-center ml-4 gap-1 bg-black/20 rounded-xl px-2 py-1 ${className}`}>
            <Palette size={14} className="text-white/80 mr-1" />
            {THEMES.map(t => (
                <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    title={t.label}
                    className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${t.dot}
                                    ${theme === t.value
                        ? 'border-white scale-110'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                />
            ))}
        </div>
    )
}