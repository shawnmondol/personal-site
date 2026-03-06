import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { extractPdfText } from '../lib/resume/extractPdfText.ts'
import { parseResumeWithAI } from '../lib/resume/parseResume.ts'
import { useResume } from '../context/ResumeContext'

type Status = 'idle' | 'extracting' | 'parsing' | 'error'

export function UploadPage() {
  const { setResume } = useResume()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File) {
    if (!file.name.endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file.')
      setStatus('error')
      return
    }

    try {
      setStatus('extracting')
      const rawText = await extractPdfText(file)

      setStatus('parsing')
      const resumeData = await parseResumeWithAI(rawText)

      setResume(resumeData)
      navigate('/resume')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const isLoading = status === 'extracting' || status === 'parsing'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">My Resume</h1>
        <p className="text-gray-500 text-center mb-8">Upload your PDF resume to get started</p>

        <div
          onClick={() => !isLoading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
            ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-100'}
            ${isLoading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={onInputChange}
          />

          {isLoading ? (
            <div className="space-y-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600 font-medium">
                {status === 'extracting' ? 'Extracting text from PDF...' : 'Parsing with AI...'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-5xl">📄</div>
              <p className="text-gray-700 font-medium">Drop your PDF here</p>
              <p className="text-gray-400 text-sm">or click to browse</p>
            </div>
          )}
        </div>

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}
      </div>
    </div>
  )
}
