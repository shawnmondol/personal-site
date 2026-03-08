interface ButtonProps {
    content: string
    onClick: () => void
    disabled?: boolean
}

const styles = {
    button: [
        "bg-linear-to-r from-orange-300 via-red-400 to-blue-500",
        "hover:bg-gradient-to-r hover:from-orange-400 hover:via-red-500 hover:to-blue-600 cursor-pointer",
        "font-bold py-2 px-4 rounded",
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