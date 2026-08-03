import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { app, db } from '../auth/firebaseService'
import type { Project } from '../../models/Project'

const PROJECT_COLLECTION = 'projects'

const storage = getStorage(app)

/** Firestore rejects `undefined`, which optional fields like `link` hit easily. */
function stripUndefined<T>(value: T): T {
    if (Array.isArray(value)) return value.map(stripUndefined) as T
    if (value === null || typeof value !== 'object') return value
    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, stripUndefined(v)])
    ) as T
}

function makeSlug(title: string): string {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    return slug || 'project'
}

/** Newest first. */
function byNewest(a: Project, b: Project) {
    return b.createdAt - a.createdAt
}

export async function getAllProjects(): Promise<Project[]> {
    const snap = await getDocs(collection(db, PROJECT_COLLECTION))
    return snap.docs.map(d => d.data() as Project).sort(byNewest)
}

/**
 * Filtered server-side rather than in the client: the security rule gates reads on
 * `published`, so an unfiltered collection read is rejected for signed-out visitors.
 */
export async function getPublishedProjects(): Promise<Project[]> {
    const q = query(collection(db, PROJECT_COLLECTION), where('published', '==', true))
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data() as Project).sort(byNewest)
}

export async function getProject(id: string): Promise<Project | null> {
    const snap = await getDoc(doc(db, PROJECT_COLLECTION, id))
    return snap.exists() ? (snap.data() as Project) : null
}

export async function saveProject(project: Project): Promise<void> {
    const updated = { ...project, updatedAt: Date.now() }
    await setDoc(doc(db, PROJECT_COLLECTION, project.id), stripUndefined(updated))
}

/** Creates an empty draft with a slug id derived from the title, avoiding collisions. */
export async function createProject(title: string): Promise<Project> {
    const base = makeSlug(title)
    let id = base
    for (let n = 2; await getProject(id); n++) {
        id = `${base}-${n}`
    }

    const now = Date.now()
    const project: Project = {
        id,
        title: title.trim(),
        tagline: '',
        technologies: [],
        published: false,
        body: [],
        createdAt: now,
        updatedAt: now,
    }
    await setDoc(doc(db, PROJECT_COLLECTION, id), project)
    return project
}

export async function deleteProject(project: Project): Promise<void> {
    const images = project.body.flatMap(b => b.type === 'image' && b.url ? [b.url] : [])
    await Promise.all(images.map(deleteProjectImage))
    await deleteDoc(doc(db, PROJECT_COLLECTION, project.id))
}

export async function uploadProjectImage(file: File, projectId: string): Promise<string> {
    const storageRef = ref(storage, `projects/${projectId}/${Date.now()}-${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    return getDownloadURL(snapshot.ref)
}

export async function deleteProjectImage(url: string): Promise<void> {
    if (!url) return
    try {
        await deleteObject(ref(storage, url))
    } catch {
        // Already gone, or not a Storage URL — nothing to clean up.
    }
}
