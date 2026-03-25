import { Link } from "react-router-dom"
import {UserMenu} from "./UserMenu.tsx"
import { useAuth } from "../../context/AuthContext.tsx"
import { useTheme, type Theme } from "../../context/ThemeContext.tsx"
import { themes } from "../../models/themes.ts"
import githubIcon from '/github.svg'
import linkedinIcon from '/linkedin.png'
import gitlabIcon from '/gitlab.svg'
import {useState} from "react"
import {Button} from "./Button.tsx"
import {Menu, Palette} from "lucide-react"

const THEMES = (Object.entries(themes) as [Theme, typeof themes[Theme]][])
    .map(([value, { label, dot }]) => ({ value, label, dot }))

export function Header() {
    const { user, loading, login, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [ hamburgerOpen, setHamburgerOpen ]  = useState(false);
    const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID
    const links = [
        { label: 'GitHub', href: import.meta.env.VITE_GITHUB, image: githubIcon },
        { label: 'LinkedIn', href: import.meta.env.VITE_LINKEDIN, image: linkedinIcon },
        { label: 'GitLab', href: import.meta.env.VITE_GITLAB, image: gitlabIcon },
    ] as { label: string; href: string; image: string }[]


    return (
        <header className="w-full h-20 bg-linear-to-r from-orange-300 via-red-400 to-blue-500 shadow-2xl">
            <div className="flex justify-end items-center px-4 h-full">
                <div className="absolute left-1/2 translate-x-[-50%]">
                    <Link to={"/"} className={"font-semibold text-3xl"}>
                        Portfolio
                    </Link>
                </div>
                {links.length > 0 && (
                    <div>
                        <Button
                            className="md:hidden text-4xl absolute justify-center left-4 translate-y-[-50%]"
                        onClick={() => setHamburgerOpen(state => !state)}
                        >
                            <Menu />
                        </Button>
                        <div className="hidden md:flex flex-wrap gap-3">
                            {links.map((link) => (
                                <Button
                                    key={link.href}
                                    onClick={() => window.open(link.href, '_blank', 'noopener,noreferrer')}
                                    className="px-2 py-2 text-sm"
                                >
                                    <img src={link.image} title={link.label} alt={link.label} width={30} height={30}/>
                                </Button>
                            ))}
                        </div>
                        <div className={`md:hidden flex w-full absolute top-20 left-0 shadow-lg p-4 
                        transition-all duration-300 overflow-hidden 
                        ${hamburgerOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                            {links.map((link) => (
                                <Button
                                    key={link.href}
                                    onClick={() => window.open(link.href, '_blank', 'noopener,noreferrer')}
                                    className="flex px-2 py-2 text-sm m-2"
                                >
                                    <div className="flex items-center">
                                        <img src={link.image} title={link.label} alt={link.label} width={30} height={30}/>
                                        <span className="ml-1">{link.label}</span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                {isAdmin && (
                    <div className="flex items-center ml-4 gap-1 bg-black/20 rounded-xl px-2 py-1">
                        <Palette size={14} className="text-white/80 mr-1" />
                        {THEMES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => setTheme(t.value)}
                                title={t.label}
                                className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${t.dot}
                                    ${theme === t.value
                                        ? 'border-white scale-110'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            />
                        ))}
                    </div>
                )}
                <div>
                    {loading ? null : !user ? (
                    <Button
                        className="ml-4 px-4 py-2  text-sm"
                        onClick={login}
                    >
                        Sign In
                    </Button>
                    ) :
                    <UserMenu user={user} logout={logout}/>
                    }
                </div>
            </div>
        </header>
    );
}