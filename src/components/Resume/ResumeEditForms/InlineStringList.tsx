import {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {InlineText} from "./InlineText.tsx";
import {removeAt, updateAt} from "./listUtils.ts";

interface Props {
    items: string[]
    onChange: (items: string[]) => void
    editMode?: boolean
    variant?: 'chip' | 'bullet'
    /** Styling for a chip in view mode; ignored for the bullet variant. */
    chipClassName?: string
    addLabel?: string
    placeholder?: string
    /** Applied to the list container, for spacing within a section. */
    className?: string
}

const defaultChipClass = "tag tag-neutral"

/**
 * A list of plain strings — skills, project technologies, experience bullets —
 * where each item is edited in place. Blank items are dropped on commit.
 */
export function InlineStringList({
    items,
    onChange,
    editMode = false,
    variant = 'chip',
    chipClassName = defaultChipClass,
    addLabel = 'Add',
    placeholder = 'New item',
    className = '',
}: Props) {
    const [justAdded, setJustAdded] = useState<number | null>(null)

    function commit(index: number, value: string) {
        setJustAdded(null)
        onChange(value ? updateAt(items, index, value) : removeAt(items, index))
    }

    function cancel(index: number) {
        setJustAdded(null)
        if (!items[index]) onChange(removeAt(items, index))
    }

    function add() {
        setJustAdded(items.length)
        onChange([...items, ''])
    }

    if (!editMode) {
        if (!items.length) return null
        return variant === 'bullet' ? (
            <ul className={`mt-3 space-y-1 ${className}`}>
                {items.map((item, i) => (
                    <li key={i} className="text-body text-sm flex gap-2 leading-relaxed">
                        <span className="text-accent-400 mt-0.5">▸</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        ) : (
            <div className={`flex flex-wrap gap-2 ${className}`}>
                {items.map((item, i) => (
                    <span key={i} className={chipClassName}>{item}</span>
                ))}
            </div>
        )
    }

    if (variant === 'bullet') {
        return (
            <ul className={`mt-3 space-y-1 ${className}`}>
                <AnimatePresence initial={false}>
                    {items.map((item, i) => (
                        <motion.li
                            key={i}
                            initial={{opacity: 0, height: 0}}
                            animate={{opacity: 1, height: 'auto'}}
                            exit={{opacity: 0, height: 0}}
                            transition={{duration: 0.15}}
                            className="group/item text-body text-sm flex gap-2 items-start"
                        >
                            <span className="text-accent-400 mt-0.5 shrink-0">▸</span>
                            <InlineText
                                value={item}
                                editMode
                                startEditing={i === justAdded}
                                placeholder={placeholder}
                                ariaLabel={`Bullet ${i + 1}`}
                                className="flex-1"
                                onChange={value => commit(i, value)}
                                onCancel={() => cancel(i)}
                            />
                            <button
                                type="button"
                                title="Remove bullet"
                                aria-label="Remove bullet"
                                onClick={() => onChange(removeAt(items, i))}
                                className="opacity-0 group-hover/item:opacity-100 text-muted hover:text-red-400 leading-none transition-all cursor-pointer shrink-0 mt-0.5"
                            >
                                ×
                            </button>
                        </motion.li>
                    ))}
                </AnimatePresence>
                <li>
                    <button
                        type="button"
                        onClick={add}
                        className="text-xs text-accent-500 hover:text-accent-700 cursor-pointer transition-colors"
                    >
                        + {addLabel}
                    </button>
                </li>
            </ul>
        )
    }

    return (
        <div className={`flex flex-wrap gap-2 items-center ${className}`}>
            <AnimatePresence initial={false}>
                {items.map((item, i) => (
                    <motion.span
                        key={i}
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.8}}
                        transition={{duration: 0.15}}
                        className={`${chipClassName} inline-flex items-center gap-1`}
                    >
                        <InlineText
                            value={item}
                            editMode
                            startEditing={i === justAdded}
                            placeholder={placeholder}
                            ariaLabel={`Item ${i + 1}`}
                            className="min-w-16"
                            onChange={value => commit(i, value)}
                            onCancel={() => cancel(i)}
                        />
                        <button
                            type="button"
                            title="Remove"
                            aria-label={`Remove ${item || 'item'}`}
                            onClick={() => onChange(removeAt(items, i))}
                            className="text-current opacity-50 hover:opacity-100 hover:text-red-500 leading-none transition-colors cursor-pointer"
                        >
                            ×
                        </button>
                    </motion.span>
                ))}
            </AnimatePresence>
            <button
                type="button"
                onClick={add}
                className="px-3 py-1 text-accent-400 text-sm rounded-full border border-dashed border-accent-300 hover:border-accent-400 hover:text-accent-600 transition-colors cursor-pointer"
            >
                {addLabel} +
            </button>
        </div>
    )
}
