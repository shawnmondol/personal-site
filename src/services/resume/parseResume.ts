import type { ResumeData } from '../../models/Resume.ts'
import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()
const parseResumeFunc = httpsCallable(functions, 'parseResume')

export async function parseResumeWithAI(rawText: string): Promise<ResumeData> {
  const result = await parseResumeFunc({ rawText })
  return result.data as ResumeData
}
