export function Loading() {
    return (
        <div className="flex justify-center items-center">
            <div className="min-h-screen flex items-center justify-center text-gray-400 mr-2">
                Loading...
            </div>
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
}