import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ResumeProvider } from './context/ResumeContext'
import { AuthProvider } from './context/AuthContext'
import { UploadPage } from './pages/UploadPage'
import { ResumePage } from './pages/ResumePage'
import {Header} from "./components/Header.tsx";
import { Toaster } from 'sonner';
import {ResumeDataPage} from "./pages/ResumeDataPage.tsx";

function AppRoutes() {

  return (
    <Routes>
        <Route path="/" element={<ResumePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/resume/data" element={<ResumeDataPage />} />
        <Route path="/resume/data/upload" element={<UploadPage />} />
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
            <Toaster />
        </AuthProvider>
    </BrowserRouter>
  )
}

export default App
