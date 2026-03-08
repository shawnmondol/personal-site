import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Props {
    children: React.ReactNode
    adminOnly?: boolean
}

export function AdminAuth({ children, adminOnly = false }: Props) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (!user) return <Navigate to="/" replace />

    if (adminOnly && user.uid !== import.meta.env.VITE_ADMIN_UID) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
