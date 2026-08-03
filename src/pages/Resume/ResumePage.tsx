import {useNavigate} from 'react-router-dom'
import {useResume} from '../../context/ResumeContext.tsx'
import {useAuth} from '../../context/AuthContext.tsx'
import {HeroSection} from '../../components/Resume/ResumeDisplay/HeroSection.tsx'
import {ExperienceSection} from '../../components/Resume/ResumeDisplay/ExperienceSection.tsx'
import {SkillsSection} from '../../components/Resume/ResumeDisplay/SkillsSection.tsx'
import {EducationSection} from '../../components/Resume/ResumeDisplay/EducationSection.tsx'
import {ProjectsSection} from '../../components/Resume/ResumeDisplay/ProjectsSection.tsx'
import {useEffect} from "react";
import {getActiveResume} from "../../services/resume/firestoreResumeService.ts";
import {Loading} from "../../components/SiteComponents/Loading.tsx";

export function ResumePage() {
    const {resume, loadResume} = useResume()
    const {user} = useAuth()
    const navigate = useNavigate()
    const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID

    useEffect(() => {
        getActiveResume().then(resume => loadResume(resume!))
    }, [])

    if (!resume) return <Loading />

    const data = resume.resumeDisplayData

    return (
        <div className="page-shell">
            <HeroSection
                name={data.name}
                title={data.title}
                summary={data.summary}
                contact={data.contact}
                fileUrl={resume.fileUrl}
            />
            <ExperienceSection experience={data.experience}/>
            <EducationSection education={data.education}/>
            <SkillsSection skills={data.skills}/>
            <ProjectsSection projects={data.projects}/>

            {isAdmin && (
                <div className="pb-10 -mt-14">
                    <button
                        onClick={() => navigate('/resume/data')}
                        className="text-sm text-muted hover:text-accent-400 cursor-pointer transition-colors"
                    >
                        Edit Content
                    </button>
                </div>
            )}
        </div>
    )
}
