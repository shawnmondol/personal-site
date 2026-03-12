import {type ReactNode, useEffect} from "react";
import {createPortal} from "react-dom";

interface PopupModalProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
}

export function PopupModal({isOpen, onClose, children}: PopupModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            return () => { document.body.style.overflow = '' }
        }
    }, [isOpen])

    if (!isOpen) return null
    return createPortal(
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3/5 max-h-3/5 flex flex-col">
                <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 cursor-pointer text-2xl z-10">
                    &times;
                </button>
                <div className="overflow-y-auto p-8">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}