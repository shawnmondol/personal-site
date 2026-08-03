import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {useAuth} from "../../context/AuthContext.tsx";
import {Loading} from "../../components/SiteComponents/Loading.tsx";
import {Button} from "../../components/SiteComponents/Button.tsx";
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
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gray-900 text-white py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold tracking-tight">Projects</h1>
                    <p className="mt-4 text-gray-300 leading-relaxed max-w-2xl">
                        Things I've built — including the ones whose source I can't share.
                    </p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {isAdmin && (
                    <div className="mb-8 flex flex-wrap gap-3 items-center">
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && void create()}
                            placeholder="New project title…"
                            className="flex-1 min-w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-accent-400"
                        />
                        <Button
                            onClick={() => void create()}
                            disabled={!title.trim() || creating}
                            className={!title.trim() || creating ? 'opacity-50 pointer-events-none' : ''}
                        >
                            {creating ? 'Creating…' : 'New Project'}
                        </Button>
                    </div>
                )}

                {projects.length === 0 ? (
                    <p className="text-gray-400 text-center py-16">
                        {isAdmin ? 'No projects yet — create your first one above.' : 'No projects published yet.'}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {projects.map(project => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                className="block border border-gray-200 bg-white rounded-xl p-5 hover:shadow-md hover:border-accent-300 transition-all"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="font-semibold text-lg text-gray-800">{project.title}</h2>
                                    {isAdmin && !project.published && (
                                        <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                            Draft
                                        </span>
                                    )}
                                </div>
                                {project.tagline && (
                                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{project.tagline}</p>
                                )}
                                {project.technologies.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {project.technologies.map((tech, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
