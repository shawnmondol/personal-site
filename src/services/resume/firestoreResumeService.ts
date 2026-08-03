import {
    collection,
    query,
    where,
    limit,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    writeBatch,
    type WriteBatch
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
    await setDoc(resumeRef, stripUndefined(resume));
}

/**
 * Queues a deactivation for every active resume except `exceptGuid`.
 * Deliberately unbounded — if the collection already has several actives, this
 * clears all of them rather than leaving stale ones behind.
 */
async function queueDeactivateOthers(batch: WriteBatch, exceptGuid: string) {
    const q = query(collection(db, RESUME_COLLECTION), where('isActive', '==', true))
    const snap = await getDocs(q)
    snap.docs
        .filter(d => d.id !== exceptGuid)
        .forEach(d => batch.update(d.ref, {isActive: false}))
}

/** Saves a new resume and makes it the only active one in a single atomic commit. */
export async function saveResumeAsActive(resume: ResumeData) {
    const batch = writeBatch(db)
    await queueDeactivateOthers(batch, resume.guid)
    batch.set(doc(db, RESUME_COLLECTION, resume.guid), stripUndefined({...resume, isActive: true}))
    await batch.commit()
}

/** Firestore rejects `undefined`, which optional resume fields (gpa, link, phone) hit easily. */
function stripUndefined<T>(value: T): T {
    if (Array.isArray(value)) return value.map(stripUndefined) as T
    if (value instanceof Date || value === null || typeof value !== 'object') return value
    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, stripUndefined(v)])
    ) as T
}

export async function updateResume(guid: string, updates: Partial<ResumeData>) {
    const resumeRef = doc(db, RESUME_COLLECTION, guid);
    await updateDoc(resumeRef, stripUndefined(updates));
}

export async function setActiveResume(guid: string) {
    const batch = writeBatch(db)
    await queueDeactivateOthers(batch, guid)
    batch.update(doc(db, RESUME_COLLECTION, guid), {isActive: true})
    await batch.commit()
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