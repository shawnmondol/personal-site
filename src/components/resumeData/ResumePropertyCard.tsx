import type {ReactNode} from "react";
import {useState} from "react";

interface ResumePropertyCardProps {
    title: string
    preview: ReactNode
    children: ReactNode
}

export function ResumePropertyCard({ title, preview, children }: ResumePropertyCardProps) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="border border-gray-700 rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(prev => !prev)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800 transition-colors"
            >
                <h2 className="text-lg font-bold text-black">{title}</h2>
                <span className="text-gray-400 text-sm">{expanded ? '▲ Close' : '▼ Edit'}</span>
            </button>

            <div className="px-4 pb-4 text-sm text-gray-400">
                {preview}
            </div>

            {expanded && (
                <div className="border-t border-gray-700 p-4 space-y-3">
                    {children}
                </div>
            )}
        </div>
    )
}