import {NavLink, useLocation, useNavigate} from "react-router-dom"
import {UserMenu} from "./UserMenu.tsx"
import {useAuth} from "../../context/AuthContext.tsx"
import {ThemePicker} from "./ThemePicker.tsx"
import {useState} from "react"
import {Menu, X} from "lucide-react"

const links = [
    {label: 'Resume', to: '/'},
    {label: 'Projects', to: '/projects'},
    {label: 'About Me', to: '/about-me'},
]

export function Header() {
    const {user, loading, login, logout} = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const {pathname} = useLocation()
    const navigate = useNavigate()

    /** Project detail pages should keep "Projects" lit. */
    function isActive(to: string) {
        return to === '/' ? pathname === '/' || pathname.startsWith('/resume') : pathname.startsWith(to)
    }

    return (
        <header
            className="sticky top-0 z-30 border-b"
            style={{
                background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)',
                backdropFilter: 'blur(10px)',
                borderColor: 'var(--color-divider)',
            }}
        >
            <nav className="nav">
                <span className="nav-brand cursor-pointer" onClick={() => navigate('/')}>
                    Shawn Mondol
                </span>

                <div className="hidden md:flex items-center gap-6">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={`nav-link ${isActive(link.to) ? 'nav-link-active' : ''}`}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <ThemePicker className="hidden md:flex" />

                {loading ? null : !user ? (
                    <button type="button" className="btn btn-secondary" onClick={() => void login()}>
                        Sign in
                    </button>
                ) : (
                    <UserMenu user={user} logout={logout} />
                )}

                <button
                    type="button"
                    aria-label="Toggle navigation"
                    onClick={() => setMenuOpen(open => !open)}
                    className="md:hidden btn btn-secondary px-2"
                >
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </nav>

            {/* Mobile drawer */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ${
                    menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                }`}
                style={{borderTop: menuOpen ? '1px solid var(--color-divider)' : 'none'}}
            >
                <div className="page-shell flex flex-col gap-4 py-4">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setMenuOpen(false)}
                            className={`nav-link ${isActive(link.to) ? 'nav-link-active' : ''}`}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    <ThemePicker />
                </div>
            </div>
        </header>
    )
}
