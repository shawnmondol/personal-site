interface ButtonProps {
    content: string
    onClick: () => void
    disabled?: boolean
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

export function Button({content, onClick, disabled}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={styles.button}>
            {content}
        </button>
    )
}