interface ButtonProps {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    className?: string
    variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({children, onClick, disabled, className = '', variant = 'primary'}: ButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant} ${className}`}
        >
            {children}
        </button>
    )
}
