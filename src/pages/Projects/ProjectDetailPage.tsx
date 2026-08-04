import {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "sonner";
import {useAuth} from "../../context/AuthContext.tsx";
import {Loading} from "../../components/SiteComponents/Loading.tsx";
import {ProjectBody} from "../../components/Projects/ProjectBody.tsx";
import {ProjectCoverImage} from "../../components/Projects/ProjectCoverImage.tsx";
import {InlineText} from "../../components/Resume/ResumeEditForms/InlineText.tsx";
import {InlineStringList} from "../../components/Resume/ResumeEditForms/InlineStringList.tsx";
import type {Project} from "../../models/Project.ts";
import {deleteProject, getProject, saveProject} from "../../services/projects/firestoreProjectService.ts";

/** Ignores updatedAt, which the service rewrites on every save. */
function fingerprint(project: Project) {
    return JSON.stringify({...project, updatedAt: 0})
}

export function ProjectDetailPage() {
    const params = useParams()
    const navigate = useNavigate()
    const {user, loading: authLoading} = useAuth()
    const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID

    const [project, setProject] = useState<Project | null>(null)
    const [saved, setSaved] = useState('')
    const [saving, setSaving] = useState(false)
    const [missing, setMissing] = useState(false)

    useEffect(() => {
        getProject(params.id!).then(loaded => {
            if (!loaded) { setMissing(true); return }
            setProject(loaded)
            setSaved(fingerprint(loaded))
        })
    }, [params.id])

    const isDirty = project !== null && fingerprint(project) !== saved

    useEffect(() => {
        if (!isDirty) return
        function warn(e: BeforeUnloadEvent) { e.preventDefault() }
        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [isDirty])

    // Wait for auth before judging visibility, or a draft flashes "unavailable" to the admin.
    if (authLoading) return <Loading />

    if (missing || (project && !project.published && !isAdmin)) {
        return (
            <div className="page-shell flex flex-col items-center justify-center gap-4 py-32">
                <p className="text-muted">That project isn't available.</p>
                <Link to="/projects">Back to projects</Link>
            </div>
        )
    }

    if (!project) return <Loading />

    function patch(updates: Partial<Project>) {
        setProject(prev => prev && {...prev, ...updates})
    }

    async function save() {
        if (!project) return
        setSaving(true)
        try {
            await saveProject(project)
            setSaved(fingerprint(project))
            toast.success('Project saved')
        } catch (error) {
            console.error(error)
            toast.error('Could not save project')
        } finally {
            setSaving(false)
        }
    }

    async function remove() {
        if (!project) return
        if (!confirm(`Delete “${project.title}” and its images? This can't be undone.`)) return
        try {
            await deleteProject(project)
            toast.success('Project deleted')
            navigate('/projects')
        } catch (error) {
            console.error(error)
            toast.error('Could not delete project')
        }
    }

    return (
        <>
            {isAdmin && (
                <div
                    className="sticky top-[57px] z-20 border-b"
                    style={{
                        background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
                        backdropFilter: 'blur(10px)',
                        borderColor: 'var(--color-divider)',
                    }}
                >
                    <div className="page-shell flex flex-wrap items-center justify-between gap-3 py-3">
                        <button
                            onClick={() => patch({published: !project.published})}
                            className={`tag ${project.published ? 'tag-accent' : 'tag-neutral'} cursor-pointer`}
                            title={project.published ? 'Unpublish this project' : 'Publish this project'}
                        >
                            {project.published ? 'Published' : 'Draft'}
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted">
                                {saving ? 'Saving…' : isDirty ? 'Unsaved changes' : 'All changes saved'}
                            </span>
                            <button onClick={() => void remove()} className="btn btn-danger">Delete</button>
                            <button onClick={() => void save()} disabled={!isDirty || saving} className="btn btn-primary">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-shell">
                <section style={{padding: '48px 0 0'}}>
                    <Link to="/projects" className="text-sm">← All projects</Link>

                    <InlineText
                        as="h1"
                        value={project.title}
                        editMode={isAdmin}
                        placeholder="Project title"
                        ariaLabel="Project title"
                        className="block mt-4"
                        onChange={title => patch({title})}
                    />

                    <InlineText
                        as="p"
                        value={project.tagline}
                        editMode={isAdmin}
                        multiline
                        rows={2}
                        placeholder="One line on what this is"
                        ariaLabel="Tagline"
                        className="block text-[17px] text-subtle mt-3 max-w-[60ch]"
                        onChange={tagline => patch({tagline})}
                    />

                    {(project.technologies.length > 0 || isAdmin) && (
                        <InlineStringList
                            items={project.technologies}
                            editMode={isAdmin}
                            addLabel="Tech"
                            placeholder="Technology"
                            className="mt-4"
                            chipClassName="tag tag-accent"
                            onChange={technologies => patch({technologies})}
                        />
                    )}

                    {isAdmin ? (
                        <div className="flex items-baseline gap-2 text-sm mt-4">
                            <span className="text-muted text-xs uppercase tracking-wider shrink-0">Link</span>
                            <InlineText
                                value={project.link ?? ''}
                                editMode
                                placeholder="Leave blank for private projects"
                                ariaLabel="Project link"
                                className="text-accent-300 flex-1 truncate"
                                onChange={link => patch({link})}
                            />
                        </div>
                    ) : project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary mt-[18px] inline-flex"
                        >
                            View project ↗
                        </a>
                    )}
                </section>

                <ProjectCoverImage
                    cover={project.cover}
                    projectId={project.id}
                    editMode={isAdmin}
                    onChange={cover => patch({cover})}
                />

                <section className="max-w-[760px]" style={{padding: '48px 0 88px'}}>
                    <ProjectBody
                        blocks={project.body}
                        projectId={project.id}
                        editMode={isAdmin}
                        onChange={body => patch({body})}
                    />
                </section>
            </div>
        </>
    )
}
