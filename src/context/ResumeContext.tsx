import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { ResumeData } from '../types/resume'

const STORAGE_KEY = 'resume_data'

interface ResumeContextValue {
  resume: ResumeData | null
  setResume: (data: ResumeData) => void
  clearResume: () => void
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, setResumeState] = useState<ResumeData | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as ResumeData) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (resume) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
    }
  }, [resume])

  function setResume(data: ResumeData) {
    setResumeState(data)
  }

  function clearResume() {
    localStorage.removeItem(STORAGE_KEY)
    setResumeState(null)
  }

  return (
    <ResumeContext.Provider value={{ resume, setResume, clearResume }}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used inside <ResumeProvider>')
  return ctx
}
