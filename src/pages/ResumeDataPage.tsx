import {useEffect, useState} from "react";
import {getAllResumes} from "../services/resume/firestoreResumeService.ts";
import {ResumeTable} from "../components/resumeData/ResumeTable.tsx";
import {Button} from "../components/SiteComponents/Button.tsx";
import type {ResumeData} from "../models/Resume.ts";

export function ResumeDataPage() {
    const [resumes, setResumes] = useState<ResumeData[] | undefined>(undefined)

    useEffect(() => {
        getAllResumes().then(data => {
            setResumes(data ?? [])
        })
    }, [])

    function handleUpload() {

    }

    return (
        <div className="m-auto w-4/5 justify-center p-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold mb-4">Resume Data</h1>
                <Button content="Add Resume" onClick={handleUpload} />
            </div>
            <ResumeTable resumes={resumes} />
        </div>
    )
}