interface ButtonProps {
    content: string
    onClick: () => void
    disabled?: boolean
}

const styles = {
    button: [
        "bg-linear-to-r from-orange-400 via-red-500 to-blue-600 border-1 border-gray-400 shadow-lg",
        "hover:bg-gradient-to-r hover:from-orange-300 hover:via-red-400 hover:to-blue-500 cursor-pointer",
        "font-bold py-2 px-4 rounded transition-transform",
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