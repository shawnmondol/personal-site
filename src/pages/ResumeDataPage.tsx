import {useEffect, useState} from "react";
import {getAllResumes} from "../services/resume/firestoreResumeService.ts";
import {ResumeTable} from "../components/resumeData/ResumeTable.tsx";
import type {ResumeData} from "../models/Resume.ts";

export function ResumeDataPage() {
    const [resumes, setResumes] = useState<ResumeData[]>([])

    useEffect(() => {
        getAllResumes().then(data => {
            if (data) setResumes(data)
        })
    }, [])

    return (
        <div className="m-auto w-4/5 justify-center p-20">
            <ResumeTable resumes={resumes} />
        </div>
    )
}