import {useEffect, useState} from "react";

export function Loading() {
    const [showTimeout, setShowTimeout] = useState<boolean>(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTimeout(true)
        }, 30000)
        return () => clearTimeout(timer)
    }, [])

    if (!showTimeout) {
        return (
            <div className="flex justify-center items-center">
                <div className="min-h-screen flex items-center justify-center text-muted mr-2">
                    Loading...
                </div>
                <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    } else {
        return (
            <div className="flex items-center justify-center text-muted">
                <div className="min-h-screen flex items-center justify-center text-muted mr-2">
                    An internal server error occurred. Please try again later.
                </div>
            </div>
        )
    }

}