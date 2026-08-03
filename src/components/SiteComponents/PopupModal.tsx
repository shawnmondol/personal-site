import {type ReactNode, useEffect} from "react";
import {createPortal} from "react-dom";

interface PopupModalProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    className? : string
}

export function PopupModal({isOpen, onClose, children, className}: PopupModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            return () => { document.body.style.overflow = '' }
        }
    }, [isOpen])

    if (!isOpen) return null
    return createPortal(
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
             onClick={e => e.stopPropagation()}>
            <div
                className="relative rounded-xl shadow-2xl w-full max-w-3/5 max-h-3/5 flex flex-col"
                style={{background: 'var(--color-surface)', border: '1px solid var(--color-divider)'}}
            >
                <button onClick={onClose} className="absolute top-3 right-4 text-muted hover:text-accent-400 cursor-pointer text-2xl z-10">
                    &times;
                </button>
                <div className={`${className ? className : "" } overflow-y-auto p-8`}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}