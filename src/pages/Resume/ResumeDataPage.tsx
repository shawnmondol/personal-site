import {getAllResumes} from "../../services/resume/firestoreResumeService.ts";
import {ResumeTable} from "../../components/Resume/ResumeData/ResumeTable.tsx";
import {Button} from "../../components/SiteComponents/Button.tsx";
import {PopupModal} from "../../components/SiteComponents/PopupModal.tsx";
import {ResumeUpload} from "../../components/Resume/ResumeData/ResumeUpload.tsx";
import {useEffect, useState} from "react";
import type {ResumeData} from "../../models/Resume.ts";


export function ResumeDataPage() {
    const [resumes, setResumes] = useState<ResumeData[] | undefined>(undefined)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        getAllResumes().then(data => {
            setResumes(data ?? [])
        })
    }, [])

    function openModal() {
        setShowModal(true)
    }

    return (
        <div className="m-auto w-full justify-center p-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold mb-4">Resume Data</h1>
                <Button onClick={openModal} >Add Resume</Button>
            </div>
            <ResumeTable resumes={resumes} />
            <PopupModal isOpen={showModal} onClose={() => setShowModal(false)}>
                <h2 className="text-xl font-bold mb-4">Add Resume</h2>
                <ResumeUpload />
            </PopupModal>
        </div>
    )
}