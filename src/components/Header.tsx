import {Link} from "react-router-dom";

export function Header() {
    const links = [
        { label: 'GitHub', href: import.meta.env.VITE_GITHUB },
        { label: 'LinkedIn', href: import.meta.env.VITE_LINKEDIN },
    ] as { label: string; href: string }[]
    return (
        <header className="w-full h-20 bg-linear-to-r from-orange-300 via-red-400 to-blue-500 border-b border-gray-700">
            <div className="flex justify-between items-center px-4 h-full">
                <div className="relative left-1/2 translate-x-[-50%]">
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
                                className="px-4 py-2 bg-gray-800 hover:bg-blue-600 text-sm text-gray-300 hover:text-white cursor-pointer rounded-lg transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}