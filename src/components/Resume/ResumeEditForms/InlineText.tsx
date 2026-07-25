import {type ElementType, type KeyboardEvent, type MouseEvent, useEffect, useRef, useState} from "react";

const Key = {
    Enter: 'Enter',
    Escape: 'Escape',
} as const

interface Props {
    value: string
    onChange: (value: string) => void
    editMode?: boolean
    /** Renders a textarea instead of an input; Enter adds a newline and blur commits. */
    multiline?: boolean
    rows?: number
    placeholder?: string
    /** Shared by the text and the input so entering edit mode doesn't shift layout. */
    className?: string
    /** Element used to render the value when not editing. */
    as?: ElementType
    /** Opens in edit mode on mount — used when a list appends a blank entry. */
    startEditing?: boolean
    /** Fires when the edit is abandoned with Escape, so lists can drop blank entries. */
    onCancel?: () => void
    /** Tone of the surface behind the text, so the hover affordance stays visible. */
    tone?: 'light' | 'dark'
    ariaLabel?: string
}

export function InlineText({
    value,
    onChange,
    editMode = false,
    multiline = false,
    rows = 3,
    placeholder = 'Click to edit',
    className = '',
    as: Tag = 'span',
    startEditing = false,
    onCancel,
    tone = 'light',
    ariaLabel,
}: Props) {
    const [editing, setEditing] = useState(() => editMode && startEditing)
    const [draft, setDraft] = useState(value)
    const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

    useEffect(() => {
        if (!editing) return
        ref.current?.focus()
        ref.current?.select()
    }, [editing])

    if (!editMode) return <Tag className={className}>{value}</Tag>

    function startEdit() {
        setDraft(value)
        setEditing(true)
    }

    function commit() {
        setEditing(false)
        const next = draft.trim()
        if (next !== value) onChange(next)
    }

    function cancel() {
        setEditing(false)
        setDraft(value)
        onCancel?.()
    }

    if (editing) {
        const editClass = `${className} bg-white text-gray-900 border border-accent-400 rounded px-1.5 py-0.5 outline-none focus:border-accent-500 w-full`
        return multiline ? (
            <textarea
                ref={ref}
                rows={rows}
                aria-label={ariaLabel}
                value={draft}
                className={editClass}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={e => {
                    if (e.key === Key.Escape) cancel()
                    if (e.key === Key.Enter && (e.metaKey || e.ctrlKey)) commit()
                }}
            />
        ) : (
            <input
                ref={ref}
                aria-label={ariaLabel}
                value={draft}
                className={editClass}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={e => {
                    if (e.key === Key.Escape) cancel()
                    if (e.key === Key.Enter) commit()
                }}
            />
        )
    }

    return (
        <Tag
            role="button"
            tabIndex={0}
            title="Click to edit"
            onClick={(e: MouseEvent) => {
                e.stopPropagation()
                startEdit()
            }}
            onKeyDown={(e: KeyboardEvent) => {
                if (e.key === Key.Enter) {
                    e.preventDefault()
                    startEdit()
                }
            }}
            className={`${className} cursor-text rounded px-1.5 py-0.5 -mx-1.5 border border-dashed border-transparent transition-colors ${
                tone === 'dark'
                    ? 'hover:border-white/40 hover:bg-white/10'
                    : 'hover:border-accent-300 hover:bg-accent-50/60'
            } ${value ? '' : 'text-gray-400 italic'}`}
        >
            {value || placeholder}
        </Tag>
    )
}
