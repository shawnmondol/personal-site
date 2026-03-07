import {doc, getDoc, setDoc} from "firebase/firestore";
import {db} from "../auth/firebaseService";
import type { ResumeData } from "../../models/Resume";

const resumeRef = doc(db, "resumes", "resume");

export async function saveResume(resume: ResumeData) {
    await setDoc(resumeRef, resume);
}

export async function getResume(): Promise<ResumeData | null> {
    const docSnap = await getDoc(resumeRef);
    if (docSnap.exists()) {
        return docSnap.data() as ResumeData;
    }
    return null;
}