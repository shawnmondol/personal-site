import { useTheme, type Theme } from "../../context/ThemeContext.tsx"
import { themes } from "../../models/themes.ts"
import {Palette} from "lucide-react";
import {useState} from "react";

export function ThemePicker({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [showThemes, setShowThemes] = useState(false);

    const THEMES = (Object.entries(themes) as [Theme, typeof themes[Theme]][])
        .map(([value, { label, dot }]) => ({ value, label, dot }))

    return (
        <div
            className={`flex items-center ml-4 bg-black/20 rounded-xl px-2 py-1
            ${className}`}
        >
            <Palette size={32}
                     className={`text-white/80 cursor-pointer`}
                     onClick={() => setShowThemes(!showThemes)}
            />
            <div className={`flex items-center justify-between transition-all duration-300
            ${showThemes ? "max-w-96 opacity-100" : "max-w-0 opacity-0 pointer-events-none overflow-hidden"}`}>
                {THEMES.map(t => (
                    <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        title={t.label}
                        className={`w-5 h-5 ml-1 rounded-full border-2 transition-all cursor-pointer ${t.dot}
                                    ${theme === t.value
                            ? 'border-white scale-110'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}