import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {useAuth} from "../../context/AuthContext.tsx";
import {Loading} from "../../components/SiteComponents/Loading.tsx";
import type {Project} from "../../models/Project.ts";
import {createProject, getAllProjects, getPublishedProjects} from "../../services/projects/firestoreProjectService.ts";

export function ProjectsPage() {
    const {user, loading: authLoading} = useAuth()
    const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID
    const navigate = useNavigate()

    const [projects, setProjects] = useState<Project[] | null>(null)
    const [title, setTitle] = useState('')
    const [creating, setCreating] = useState(false)

    // Waiting for auth avoids fetching the published-only list and then refetching as admin.
    useEffect(() => {
        if (authLoading) return
        const load = isAdmin ? getAllProjects : getPublishedProjects
        load().then(setProjects)
    }, [isAdmin, authLoading])

    if (authLoading || !projects) return <Loading />

    async function create() {
        const name = title.trim()
        if (!name) return
        setCreating(true)
        try {
            const project = await createProject(name)
            toast.success(`Created “${project.title}”`)
            navigate(`/projects/${project.id}`)
        } catch (error) {
            console.error(error)
            toast.error('Could not create project')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="page-shell">
            <section style={{padding: '80px 0 32px'}}>
                <h1>Projects</h1>
                <p className="text-subtle text-base leading-relaxed max-w-[56ch] mt-4">
                    Things I've built — including the ones whose source I can't share.
                </p>
            </section>

            {isAdmin && (
                <div className="flex flex-wrap gap-3 items-center mb-6">
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && void create()}
                        placeholder="New project title…"
                        className="flex-1 min-w-56 rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-divider)',
                            color: 'var(--color-text)',
                        }}
                    />
                    <button
                        onClick={() => void create()}
                        disabled={!title.trim() || creating}
                        className="btn btn-primary"
                    >
                        {creating ? 'Creating…' : 'New Project'}
                    </button>
                </div>
            )}

            <section className="flex flex-col gap-3.5" style={{paddingBottom: 88}}>
                {projects.length === 0 ? (
                    <p className="text-muted py-12 text-center">
                        {isAdmin ? 'No projects yet — create your first one above.' : 'No projects published yet.'}
                    </p>
                ) : projects.map(project => (
                    <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="card elev-sm"
                        style={{padding: 22}}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="card-title text-[19px]">{project.title}</h2>
                            {isAdmin && !project.published && (
                                <span className="tag tag-accent shrink-0">Draft</span>
                            )}
                        </div>
                        {project.tagline && <p className="card-body">{project.tagline}</p>}
                        {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {project.technologies.map((tech, i) => (
                                    <span key={i} className="tag tag-neutral">{tech}</span>
                                ))}
                            </div>
                        )}
                    </Link>
                ))}
            </section>
        </div>
    )
}
