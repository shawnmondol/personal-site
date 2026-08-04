import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { app, db } from '../auth/firebaseService'
import type { Project, ProjectCover } from '../../models/Project'
import type { ResizedImage } from '../images/resizeImage'
import { FULL_MAX_EDGE, FULL_QUALITY, resizeForGallery, resizeImage } from '../images/resizeImage'

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
    await Promise.all([...images.map(deleteProjectImage), deleteProjectCover(project.cover)])
    await deleteDoc(doc(db, PROJECT_COLLECTION, project.id))
}

function baseName(file: File): string {
    return file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-')
}

/** Timestamped paths mean every object is immutable — cache it aggressively. */
async function upload(path: string, image: ResizedImage, file: File): Promise<string> {
    const snapshot = await uploadBytes(ref(storage, `${path}.${image.ext}`), image.blob, {
        cacheControl: 'public, max-age=31536000, immutable',
        contentType: image.blob.type || file.type,
    })
    return getDownloadURL(snapshot.ref)
}

export async function uploadProjectImage(file: File, projectId: string): Promise<string> {
    // Body images render full-width, so they need downscaling but no separate thumbnail.
    const resized = await resizeImage(file, FULL_MAX_EDGE, FULL_QUALITY)
    return upload(`projects/${projectId}/${Date.now()}-${baseName(file)}`, resized, file)
}

/** The cover is shown both as a hero and as a card thumbnail, so it needs both sizes. */
export async function uploadProjectCover(file: File, projectId: string): Promise<ProjectCover> {
    const { full, thumb } = await resizeForGallery(file)
    const stem = `projects/${projectId}/cover-${Date.now()}-${baseName(file)}`

    const [url, thumbUrl] = await Promise.all([
        upload(stem, full, file),
        upload(`${stem}-thumb`, thumb, file),
    ])
    return { url, thumb: thumbUrl }
}

/** Removes both renders, or the thumbnail is orphaned in Storage forever. */
export async function deleteProjectCover(cover: ProjectCover | undefined): Promise<void> {
    if (!cover) return
    await Promise.all([
        deleteProjectImage(cover.url),
        cover.thumb && cover.thumb !== cover.url ? deleteProjectImage(cover.thumb) : undefined,
    ])
}

export async function deleteProjectImage(url: string): Promise<void> {
    if (!url) return
    try {
        await deleteObject(ref(storage, url))
    } catch {
        // Already gone, or not a Storage URL — nothing to clean up.
    }
}
