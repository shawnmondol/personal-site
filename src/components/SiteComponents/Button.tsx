interface ButtonProps {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    className?: string
}

const styles = {
    button: [
        "border-1 bg-blue-400 border-blue-600 shadow-xl",
        "hover:bg-blue-600 cursor-pointer",
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