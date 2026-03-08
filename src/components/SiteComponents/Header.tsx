import { Link } from "react-router-dom"
import {UserMenu} from "./UserMenu.tsx"
import { useAuth } from "../../context/AuthContext.tsx"
import githubIcon from '/github.svg'
import linkedinIcon from '/linkedin.png'
import gitlabIcon from '/gitlab.svg'

export function Header() {
    const { user, loading, login, logout } = useAuth();
    const links = [
        { label: 'GitHub', href: import.meta.env.VITE_GITHUB, image: githubIcon },
        { label: 'LinkedIn', href: import.meta.env.VITE_LINKEDIN, image: linkedinIcon },
        { label: 'GitLab', href: import.meta.env.VITE_GITLAB, image: gitlabIcon },
    ] as { label: string; href: string; image: string }[]
    return (
        <header className="w-full h-20 bg-linear-to-r from-orange-300 via-red-400 to-blue-500 border-b-2 border-gray-500">
            <div className="flex justify-end items-center px-4 h-full">
                <div className="absolute left-1/2 translate-x-[-50%]">
                    <Link to={"/"} className={"font-semibold text-3xl"}>
                        Shawn's Workshop
                    </Link>
                </div>
                {links.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-2 bg-gray-800 hover:bg-blue-600 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg transition-colors"
                            >
                                <img src={link.image} title={link.label} alt={link.label} width={30} height={30}/>
                            </a>
                        ))}
                    </div>
                )}
                <div>
                    {loading ? null : !user ? (
                    <button
                        className="ml-4 px-4 py-2 bg-gray-800 hover:bg-blue-600 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg transition-colors"
                        onClick={login}
                    >
                        Sign In
                    </button>
                    ) :
                    <UserMenu user={user} logout={logout}/>
                    }
                </div>
            </div>
        </header>
    );
}