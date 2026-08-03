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
        <div className="page-shell" style={{paddingBlock: '64px 88px'}}>
            <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
                <h1 className="text-3xl font-bold">Resume Data</h1>
                <Button onClick={openModal}>Add Resume</Button>
            </div>
            <ResumeTable resumes={resumes} />
            <PopupModal isOpen={showModal} onClose={() => setShowModal(false)}>
                <h2 className="text-xl font-bold mb-4">Add Resume</h2>
                <ResumeUpload />
            </PopupModal>
        </div>
    )
}
