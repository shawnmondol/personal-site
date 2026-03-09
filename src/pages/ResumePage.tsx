import {useNavigate} from 'react-router-dom'
import {useResume} from '../context/ResumeContext'
import {useAuth} from '../context/AuthContext'
import {HeroSection} from '../components/resumeDisplay/HeroSection'
import {ExperienceSection} from '../components/resumeDisplay/ExperienceSection'
import {SkillsSection} from '../components/resumeDisplay/SkillsSection'
import {EducationSection} from '../components/resumeDisplay/EducationSection'
import {ProjectsSection} from '../components/resumeDisplay/ProjectsSection'
import {useEffect} from "react";
import {getActiveResume} from "../services/resume/firestoreResumeService.ts";
import {Loading} from "../components/SiteComponents/Loading.tsx";

export function ResumePage() {
    const {resume, loadResume} = useResume()
    const {user} = useAuth()
    const navigate = useNavigate()
    const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID

    useEffect(() => {
        getActiveResume().then(resume => loadResume(resume!))
    }, [])

    if (!resume) return <Loading />

    function handleEdit() {
        navigate('/resume/data')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection
                name={resume.resumeDisplayData.name}
                title={resume.resumeDisplayData.title}
                summary={resume.resumeDisplayData.summary}
                contact={resume.resumeDisplayData.contact}
            />

            <main className="max-w-3xl mx-auto px-6 py-12 space-y-14">
                <ExperienceSection experience={resume.resumeDisplayData.experience}/>
                <SkillsSection skills={resume.resumeDisplayData.skills}/>
                <ProjectsSection projects={resume.resumeDisplayData.projects}/>
                <EducationSection education={resume.resumeDisplayData.education}/>
            </main>
            { isAdmin &&
                <footer className="text-center pb-10">
                    <button
                        onClick={handleEdit}
                        className="text-sm text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                    >
                        Edit Content
                    </button>
                </footer>
            }
        </div>
    )
}
