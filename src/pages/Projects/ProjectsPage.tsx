import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {useAuth} from "../../context/AuthContext.tsx";
import {Loading} from "../../components/SiteComponents/Loading.tsx";
import type {Project} from "../../models/Project.ts";
import {coverThumb} from "../../models/Project.ts";
import {createProject, getAllProjects, getPublishedProjects} from "../../services/projects/firestoreProjectService.ts";

export function ProjectsPage() {
    const {user, loading: authLoading} = useAuth()
    const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID
    const navigate = useNavigate()

    const [projects, setProjects] = useState<Project[] | null>(null)
    const [creating, setCreating] = useState(false)

    // Waiting for auth avoids fetching the published-only list and then refetching as admin.
    useEffect(() => {
        if (authLoading) return
        const load = isAdmin ? getAllProjects : getPublishedProjects
        load().then(setProjects)
    }, [isAdmin, authLoading])

    if (authLoading || !projects) return <Loading />

    async function create() {
        if (creating) return
        setCreating(true)
        try {
            const project = await createProject('New Project')
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
                <div className="flex flex-wrap gap-4 items-end justify-between">
                    <div>
                        <h1>Projects</h1>
                        <p className="text-subtle text-base leading-relaxed max-w-[56ch] mt-4">
                            Things I've built — including the ones whose source I can't share.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => void create()}
                            disabled={creating}
                            className="btn btn-primary shrink-0"
                        >
                            {creating ? 'Creating…' : 'New Project'}
                        </button>
                    )}
                </div>
            </section>

            <section style={{paddingBottom: 88}}>
                {projects.length === 0 ? (
                    <p className="text-muted py-12 text-center">
                        {isAdmin ? 'No projects yet — create your first one above.' : 'No projects published yet.'}
                    </p>
                ) : (
                    <div className="flex flex-col gap-[18px]">
                        {projects.map(project => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                className="card elev-sm overflow-hidden gap-0! sm:flex-row!"
                            >
                                <div className="relative shrink-0 sm:w-[280px] sm:min-h-[172px]">
                                    {project.cover ? (
                                        <img
                                            src={coverThumb(project.cover)}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-[170px] object-cover sm:absolute sm:inset-0 sm:h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-[170px] bg-linear-to-br from-accent-800 to-accent-950 sm:absolute sm:inset-0 sm:h-full" />
                                    )}
                                    {isAdmin && !project.published && (
                                        <span
                                            className="absolute top-2 right-2 tag tag-accent backdrop-blur-sm"
                                            style={{background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)'}}
                                        >
                                            Draft
                                        </span>
                                    )}
                                </div>
                                <div className="px-[18px] pt-4 pb-5 flex flex-col gap-2 sm:justify-center sm:py-[18px]">
                                    <h2 className="card-title text-[18px]">{project.title}</h2>
                                    {project.tagline && <p className="card-body text-[13.5px]">{project.tagline}</p>}
                                    {project.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.technologies.map((tech, i) => (
                                                <span key={i} className="tag tag-neutral">{tech}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
