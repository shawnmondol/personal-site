import {ChevronDown, ChevronUp, X} from "lucide-react";

interface Props {
    index: number
    total: number
    label: string
    onMove: (to: number) => void
    onRemove: () => void
    className?: string
}

const buttonClass = "p-1 rounded text-muted hover:text-accent-400 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-default cursor-pointer transition-colors"

/** Reorder/remove cluster for one entry in a section. Parent needs `group relative`. */
export function EntryControls({index, total, label, onMove, onRemove, className = ''}: Props) {
    return (
        <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ${className}`}>
            <button
                type="button"
                title={`Move ${label} up`}
                aria-label={`Move ${label} up`}
                disabled={index === 0}
                onClick={() => onMove(index - 1)}
                className={buttonClass}
            >
                <ChevronUp size={16} />
            </button>
            <button
                type="button"
                title={`Move ${label} down`}
                aria-label={`Move ${label} down`}
                disabled={index === total - 1}
                onClick={() => onMove(index + 1)}
                className={buttonClass}
            >
                <ChevronDown size={16} />
            </button>
            <button
                type="button"
                title={`Remove ${label}`}
                aria-label={`Remove ${label}`}
                onClick={onRemove}
                className="p-1 rounded text-muted hover:text-red-400 hover:bg-red-500/15 cursor-pointer transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    )
}

interface AddEntryButtonProps {
    onClick: () => void
    children: React.ReactNode
    className?: string
}

export function AddEntryButton({onClick, children, className = ''}: AddEntryButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-sm text-accent-400 hover:text-accent-300 cursor-pointer transition-colors ${className}`}
        >
            + {children}
        </button>
    )
}
