interface ButtonProps {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    className?: string
}

const styles = {
    button: [
        "border-1 bg-accent-500 border-accent-400 shadow-xl",
        "hover:bg-accent-400 cursor-pointer",
        "font-bold py-2 px-4 rounded-xl transition-colors transition-transform duration-300",
        "hover:scale-95 hover:shadow-sm",
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