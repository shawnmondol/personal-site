import {
    collection,
    query,
    where,
    limit,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc
} from "firebase/firestore";
import {app, db} from "../auth/firebaseService";
import type {ResumeData} from "../../models/Resume";
import {getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";

const RESUME_COLLECTION = "resumes";

const storage = getStorage(app);

export async function uploadResumePdf(file: File, guid: string) {
    const storageRef = ref(storage, `resumes/${guid}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref)
}

export async function saveResume(resume: ResumeData) {
    const resumeRef = doc(db, RESUME_COLLECTION, resume.guid);
    await setDoc(resumeRef, resume);
}

export async function updateResume(guid: string, updates: Partial<ResumeData>) {
    const resumeRef = doc(db, RESUME_COLLECTION, guid);
    await updateDoc(resumeRef, updates);
}

export async function setActiveResume(guid: string) {
    const q = query(collection(db, RESUME_COLLECTION), where('isActive', '==', true), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) {
        await updateResume(snap.docs[0].id, {isActive: false})
    }
    await updateResume(guid, {isActive: true})
}

export async function getActiveResume(): Promise<ResumeData | null> {
    const q = query(collection(db, RESUME_COLLECTION), where('isActive', '==', true), limit(1))
    const snap = await getDocs(q)
    return snap.empty ? null : snap.docs[0].data() as ResumeData
}

export async function getResume(guid: string): Promise<ResumeData | null> {
    const resumeRef = doc(db, RESUME_COLLECTION, guid);
    const docSnap = await getDoc(resumeRef);
    if (docSnap.exists()) {
        return docSnap.data() as ResumeData;
    }
    return null;
}

export async function getAllResumes(): Promise<ResumeData[] | null> {
    const querySnapshot = await getDocs(collection(db, RESUME_COLLECTION));
    return querySnapshot.docs.map(doc => doc.data() as ResumeData);
}