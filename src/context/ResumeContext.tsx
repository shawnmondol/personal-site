import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type {ResumeData, ResumeDisplayData} from '../models/Resume.ts'

const STORAGE_KEY = 'resume_data'

interface ResumeContextValue {
  resume: ResumeData | null
  setResume: (data: ResumeDisplayData) => void
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

  function setResume(data: ResumeDisplayData) {

    const resumeData: ResumeData = {
      guid: crypto.randomUUID(),
      resumeDisplayData: data,
      uploadDate: new Date(),
      lastUpdated: undefined,
      fileName: "resume",
      fileUrl: undefined
    }
    setResumeState(resumeData)
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
