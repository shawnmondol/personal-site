export function Footer() {
    return (
        <footer
            className="page-shell text-muted"
            style={{
                paddingTop: 32,
                paddingBottom: 40,
                fontSize: 13,
                borderTop: '1px solid var(--color-divider)',
            }}
        >
            © {new Date().getFullYear()} Shawn Mondol.
        </footer>
    )
}
