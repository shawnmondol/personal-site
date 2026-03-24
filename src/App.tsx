import {BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom'
import { ResumeProvider } from './context/ResumeContext'
import { AuthProvider } from './context/AuthContext'
import { ResumePage } from './pages/ResumePage'
import {Header} from "./components/SiteComponents/Header.tsx"
import { Toaster } from 'sonner'
import {ResumeDataPage} from "./pages/ResumeDataPage.tsx"
import {AdminAuth} from "./components/SiteComponents/AdminAuth.tsx"
import {EditResumePage} from "./pages/EditResumePage.tsx"
import {AboutMe} from "./pages/AboutMe.tsx"

function AppRoutes() {

  return (
    <Routes>
        <Route path={"*"} element={<Navigate to="/" replace />} />

        {/* Public Routes */}
        <Route path={"/"} element={<ResumePage />} />
        <Route path={"/resume"} element={<ResumePage />} />
        <Route path={"/about-me"} element={<AboutMe />} />

        {/* Admin Routes */}
        <Route element={<AdminAuth adminOnly={true}><Outlet /></AdminAuth>}>
            <Route path="/resume/data" element={<ResumeDataPage />}/>
            <Route path={"/resume/:guid/edit"} element={<EditResumePage />}/>
        </Route>
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
