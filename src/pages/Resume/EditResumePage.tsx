import {useNavigate, useParams} from "react-router-dom";
import type {ResumeData, ResumeDisplayData} from "../../models/Resume.ts";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {Loading} from "../../components/SiteComponents/Loading.tsx";
import {getResume, updateResume} from "../../services/resume/firestoreResumeService.ts";
import {Button} from "../../components/SiteComponents/Button.tsx";
import {MoveLeft} from "lucide-react";
import {HeroSection} from "../../components/Resume/ResumeDisplay/HeroSection.tsx";
import {ExperienceSection} from "../../components/Resume/ResumeDisplay/ExperienceSection.tsx";
import {SkillsSection} from "../../components/Resume/ResumeDisplay/SkillsSection.tsx";
import {ProjectsSection} from "../../components/Resume/ResumeDisplay/ProjectsSection.tsx";
import {EducationSection} from "../../components/Resume/ResumeDisplay/EducationSection.tsx";

export function EditResumePage() {
    const params = useParams()
    const navigate = useNavigate()
    const [resume, setResume] = useState<ResumeData | null>(null)
    const [data, setData] = useState<ResumeDisplayData | null>(null)
    const [saved, setSaved] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        getResume(params.guid!).then(loaded => {
            if (!loaded) return
            setResume(loaded)
            setData(loaded.resumeDisplayData)
            setSaved(JSON.stringify(loaded.resumeDisplayData))
        })
    }, [params.guid])

    const isDirty = data !== null && JSON.stringify(data) !== saved

    useEffect(() => {
        if (!isDirty) return
        function warn(e: BeforeUnloadEvent) { e.preventDefault() }
        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [isDirty])

    if (!data || !resume) return <Loading />

    function patch(updates: Partial<ResumeDisplayData>) {
        setData(prev => prev && {...prev, ...updates})
    }

    function discard() {
        setData(JSON.parse(saved) as ResumeDisplayData)
    }

    async function save() {
        if (!data || !resume) return
        setSaving(true)
        try {
            await updateResume(resume.guid, {resumeDisplayData: data, lastUpdated: new Date()})
            setSaved(JSON.stringify(data))
            toast.success('Resume saved')
        } catch (error) {
            console.error(error)
            toast.error('Could not save resume')
        } finally {
            setSaving(false)
        }
    }

    function leave() {
        if (isDirty && !confirm('You have unsaved changes. Leave without saving?')) return
        navigate('/resume/data')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                    <Button onClick={leave} className="flex items-center justify-center">
                        <MoveLeft className="mr-2 h-4 w-4"/>
                        Back To Dashboard
                    </Button>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                            {saving ? 'Saving…' : isDirty ? 'Unsaved changes' : 'All changes saved'}
                        </span>
                        {isDirty && !saving && (
                            <button
                                onClick={discard}
                                className="text-sm text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                            >
                                Discard
                            </button>
                        )}
                        <Button
                            onClick={save}
                            disabled={!isDirty || saving}
                            className={!isDirty || saving ? 'opacity-50 pointer-events-none' : ''}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>

            <HeroSection
                name={data.name}
                title={data.title}
                summary={data.summary}
                contact={data.contact}
                editMode
                onChange={updated => patch(updated)}
            />

            <main className="max-w-3xl mx-auto px-6 py-12 space-y-14">
                <ExperienceSection experience={data.experience} editMode onChange={experience => patch({experience})} />
                <SkillsSection skills={data.skills} editMode onChange={skills => patch({skills})} />
                <ProjectsSection projects={data.projects} editMode onChange={projects => patch({projects})} />
                <EducationSection education={data.education} editMode onChange={education => patch({education})} />
            </main>
        </div>
    )
}
