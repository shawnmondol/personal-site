import {useEffect, useState} from "react";
import {getAllResumes} from "../services/resume/firestoreResumeService.ts";
import {ResumeTable} from "../components/resumeData/ResumeTable.tsx";
import type {ResumeData} from "../models/Resume.ts";

export function ResumeDataPage() {
    const [resumes, setResumes] = useState<ResumeData[] | undefined>(undefined)

    useEffect(() => {
        getAllResumes().then(data => {
            setResumes(data ?? [])
        })
    }, [])

    return (
        <div className="m-auto w-4/5 justify-center p-20">
            <h1 className="text-3xl font-bold mb-4">Resume Data</h1>
            <ResumeTable resumes={resumes} />
        </div>
    )
}