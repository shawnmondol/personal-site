import {doc, getDoc, setDoc} from "firebase/firestore";
import {db} from "../auth/firebaseService";
import type { ResumeData } from "../../models/Resume";

const RESUME_COLLECTION = "resumes";

export async function saveResume(resume: ResumeData) {
    const resumeRef = doc(db, RESUME_COLLECTION, resume.guid);
    await setDoc(resumeRef, resume);
}

export async function getResume(guid: string): Promise<ResumeData | null> {
    const resumeRef = doc(db, RESUME_COLLECTION, guid);
    const docSnap = await getDoc(resumeRef);
    if (docSnap.exists()) {
        return docSnap.data() as ResumeData;
    }
    return null;
}