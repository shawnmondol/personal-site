import {useRef, useEffect, useState} from "react"
import type {User} from "firebase/auth";

export function UserMenu({user, logout}: { user: User, logout: () => Promise<void> }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [])

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                aria-label="Account menu"
                onClick={() => setMenuOpen(prev => !prev)}
                className="w-8 h-8 rounded-full overflow-hidden cursor-pointer flex items-center justify-center"
                style={{border: '1px solid var(--color-divider)', background: 'var(--color-surface)'}}
            >
                {user.photoURL
                    ? <img src={user.photoURL} alt="" className="w-full h-full object-cover"/>
                    : <span className="text-xs">{user.displayName?.[0] ?? '?'}</span>}
            </button>

            <div
                className={`absolute right-0 mt-2 w-36 rounded-xl z-50 elev-sm transition-all duration-200 ${
                    menuOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-1 pointer-events-none"
                }`}
                style={{background: 'var(--color-surface)', border: '1px solid var(--color-divider)'}}
            >
                <button
                    className="w-full text-left px-4 py-2.5 text-sm cursor-pointer rounded-xl transition-colors hover:text-accent-400"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
