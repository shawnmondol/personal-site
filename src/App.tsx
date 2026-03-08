import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ResumeProvider } from './context/ResumeContext'
import { AuthProvider } from './context/AuthContext'
import { ResumePage } from './pages/ResumePage'
import {Header} from "./components/SiteComponents/Header.tsx";
import { Toaster } from 'sonner';
import {ResumeDataPage} from "./pages/ResumeDataPage.tsx";
import {AdminAuth} from "./components/SiteComponents/AdminAuth.tsx";

function AppRoutes() {

  return (
    <Routes>
        <Route path="/" element={<ResumePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/resume/data" element={
            <AdminAuth adminOnly={true}>
                <ResumeDataPage />
            </AdminAuth>
        }/>
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
