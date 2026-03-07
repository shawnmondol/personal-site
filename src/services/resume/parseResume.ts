import type {ResumeDisplayData} from '../../models/Resume.ts'
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { app } from '../auth/firebaseService.ts'

const functions = getFunctions(app)

if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, 'localhost', 5001)
}

const parseResumeFunc = httpsCallable(functions, 'parseResume')

export async function parseResumeWithAI(rawText: string): Promise<ResumeDisplayData> {
  const result = await parseResumeFunc({ rawText })
  return result.data as ResumeDisplayData
}

