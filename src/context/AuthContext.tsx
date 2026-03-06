import {createContext, useContext, useEffect, useState} from "react"
import {onAuthStateChanged, type User} from 'firebase/auth'
import {auth} from '../services/auth/firebaseService.ts'
import {login, logout} from "../services/auth/userAuthService.ts"

interface AuthContextType {
    user: User | null
    loading: boolean
    login: () => Promise<User>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider ({children}: { children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        })
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}