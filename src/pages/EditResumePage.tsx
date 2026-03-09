import {useNavigate, useParams} from "react-router-dom";
import type {ResumeDisplayData} from "../models/Resume.ts";
import {useEffect, useState} from "react";
import {Loading} from "../components/SiteComponents/Loading.tsx";
import {getResume} from "../services/resume/firestoreResumeService.ts";
import {Button} from "../components/SiteComponents/Button.tsx";
import {MoveLeft} from "lucide-react";
import {HeroSection} from "../components/resumeDisplay/HeroSection.tsx";
import {ExperienceSection} from "../components/resumeDisplay/ExperienceSection.tsx";
import {SkillsSection} from "../components/resumeDisplay/SkillsSection.tsx";
import {ProjectsSection} from "../components/resumeDisplay/ProjectsSection.tsx";
import {EducationSection} from "../components/resumeDisplay/EducationSection.tsx";


export function EditResumePage() {
    const params = useParams()
    const [resumeData, setResumeData] = useState<ResumeDisplayData | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        getResume(params.guid!).then(data => {
            setResumeData(data?.resumeDisplayData ?? null)
        })
    }, [params.guid])

    if (!resumeData) return <Loading />
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 text-white">
            <Button
                onClick={() => navigate('/resume/data')}
                className={"flex items-center justify-center"}
            >
                <MoveLeft className="mr-2 h-4 w-4"/>
                Back To Dashboard
            </Button>
            <HeroSection
                name={resumeData.name}
                title={resumeData.title}
                summary={resumeData.summary}
                contact={resumeData.contact}
                editMode={true}
            />
            <main className="max-w-3xl mx-auto px-6 py-12 space-y-14">
                <ExperienceSection experience={resumeData.experience} editMode={true}/>
                <SkillsSection skills={resumeData.skills} editMode={true} onChange={skills => setResumeData({...resumeData, skills})} />
                <ProjectsSection projects={resumeData.projects} editMode={true}/>
                <EducationSection education={resumeData.education} editMode={true}/>
            </main>
        </div>
    )
}