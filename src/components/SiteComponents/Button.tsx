interface ButtonProps {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    className?: string
}

const styles = {
    button: [
        "border-1 bg-amber-600 border-amber-400 shadow-xl",
        "hover:bg-amber-400 cursor-pointer",
        "font-bold py-2 px-4 rounded-xl transition-transform",
        "active:scale-95 active:shadow-sm",
        "text-white"
    ].join(' ')
}

export function Button({children, onClick, disabled, className}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={styles.button + ' ' + className}>
            {children}
        </button>
    )
}