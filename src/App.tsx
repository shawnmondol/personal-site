import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6 w-80">
        <h1 className="text-2xl font-bold text-gray-800">Tailwind v4 Demo</h1>

        <div className="flex gap-2">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">React</span>
          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">Vite</span>
          <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-full">Tailwind</span>
        </div>

        <p className="text-5xl font-mono font-bold text-gray-700">{count}</p>

        <div className="flex gap-3">
          <button
            onClick={() => setCount(c => c - 1)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
          >
            −
          </button>
          <button
            onClick={() => setCount(0)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setCount(c => c + 1)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
