import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ResumeProvider, useResume } from './context/ResumeContext'
import { UploadPage } from './pages/UploadPage'
import { ResumePage } from './pages/ResumePage'

function AppRoutes() {
  const { resume } = useResume()

  return (
    <Routes>
      <Route path="/" element={resume ? <Navigate to="/resume" replace /> : <UploadPage />} />
      <Route path="/resume" element={<ResumePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ResumeProvider>
        <AppRoutes />
      </ResumeProvider>
    </BrowserRouter>
  )
}

export default App
