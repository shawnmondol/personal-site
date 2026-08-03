import { createContext, useContext, useState, type ReactNode } from 'react'
import type {ResumeData, ResumeDisplayData} from '../models/Resume.ts'
import {saveResumeAsActive, uploadResumePdf} from "../services/resume/firestoreResumeService.ts";

interface ResumeContextValue {
  resume: ResumeData | null
  setResume: (data: ResumeDisplayData, file: File) => Promise<void>
  loadResume: (data: ResumeData) => void
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, setResumeState] = useState<ResumeData | null>(null)

  async function setResume(data: ResumeDisplayData, file: File) {
    const guid = crypto.randomUUID()
    const fileUrl = await uploadResumePdf(file, guid)
    const resumeData: ResumeData = {
      guid,
      resumeDisplayData: data,
      uploadDate: new Date(),
      lastUpdated: new Date(),
      fileName: file.name,
      fileUrl,
      isActive: true
    }
    // Deactivates any previously active resume in the same commit.
    await saveResumeAsActive(resumeData)
    setResumeState(resumeData)
  }

  function loadResume(data: ResumeData) {
    setResumeState(data)
  }

  return (
    <ResumeContext.Provider value={{ resume, setResume, loadResume}}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used inside <ResumeProvider>')
  return ctx
}
