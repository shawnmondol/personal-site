import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ResumeProvider, useResume } from './context/ResumeContext'
import { AuthProvider } from './context/AuthContext'
import { UploadPage } from './pages/UploadPage'
import { ResumePage } from './pages/ResumePage'
import {Header} from "./components/Header.tsx";

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
        <AuthProvider>
            <Header />
            <ResumeProvider>
                <AppRoutes />
            </ResumeProvider>
        </AuthProvider>
    </BrowserRouter>
  )
}

export default App
