import {useResume} from "../../../context/ResumeContext.tsx";
import {useNavigate} from "react-router-dom";
import {useRef, useState} from "react";
import {extractPdfText} from "../../../services/resume/extractPdfText.ts";
import {parseResumeWithAI} from "../../../services/resume/parseResume.ts";
import {toast} from "sonner";

type Status = 'idle' | 'extracting' | 'parsing' | 'error'

export function ResumeUpload() {
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
            const resumeDisplayData = await parseResumeWithAI(rawText)
            await setResume(resumeDisplayData, file)
            toast.success('Resume uploaded successfully!')
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
        <div className="flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <p className="text-muted text-center mb-8">Upload your PDF resume to get started</p>

                <div
                    onClick={() => !isLoading && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
            ${dragging
                        ? 'border-accent-400 bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]'
                        : 'border-[var(--color-divider)] hover:border-accent-400 hover:bg-white/5'}
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
                            <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-body font-medium">
                                {status === 'extracting' ? 'Extracting text from PDF...' : 'Parsing with AI...'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-5xl">📄</div>
                            <p className="font-medium">Drop your PDF here</p>
                            <p className="text-muted text-sm">or click to browse</p>
                        </div>
                    )}
                </div>

                {status === 'error' && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                        <strong>Error:</strong> {errorMsg}
                    </div>
                )}
            </div>
        </div>
    )
}