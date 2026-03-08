interface PopupModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

export function PopupModal({isOpen, onClose, children}: PopupModalProps) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="relative bg-white p-8 rounded-lg shadow-2xl w-full max-w-3/5 max-h-3/5 h-full overflow-y-auto">
                <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 cursor-pointer text-2xl">
                    &times;
                </button>
                {children}
            </div>
        </div>
    )
}