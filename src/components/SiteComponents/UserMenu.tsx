import {useRef, useEffect, useState} from "react"
import type {User} from "firebase/auth";

export function UserMenu({user, logout}: { user: User, logout: () => Promise<void> }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const dropdownClass = [
        "absolute right-0 mt-2 w-36",
        "bg-gray-800 border border-gray-600",
        "rounded-lg shadow-lg z-50",
        "transition-all duration-200 ease-in-out",
        menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none",
    ].join(" ")

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
        <div>
            <div
                className="ml-4 w-12 h-12 rounded-full border border-amber-400
                bg-amber-600 cursor-pointer
                flex items-center justify-center overflow-hidden">
                <img src={user.photoURL ?? undefined}
                     alt="Profile"
                     width={30}
                     height={30}
                     onClick={() => setMenuOpen(prev => !prev)}/>
            </div>
            <div
                className={dropdownClass}>
                <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-accent-600 hover:text-white cursor-pointer rounded-lg"
                    onClick={logout}>
                    Logout
                </button>
            </div>
        </div>

    );
}
