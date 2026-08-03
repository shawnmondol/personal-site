import {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "sonner";
import {ExternalLink, MoveLeft} from "lucide-react";
import {useAuth} from "../../context/AuthContext.tsx";
import {Loading} from "../../components/SiteComponents/Loading.tsx";
import {Button} from "../../components/SiteComponents/Button.tsx";
import {ProjectBody} from "../../components/Projects/ProjectBody.tsx";
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
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500">That project isn't available.</p>
                <Link to="/projects" className="text-accent-600 hover:text-accent-700">Back to projects</Link>
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

    function leave() {
        if (isDirty && !confirm('You have unsaved changes. Leave without saving?')) return
        navigate('/projects')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {isAdmin && (
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
                    <div className="max-w-3xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                        <Button onClick={leave} className="flex items-center justify-center">
                            <MoveLeft className="mr-2 h-4 w-4"/>
                            All Projects
                        </Button>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => patch({published: !project.published})}
                                title={project.published ? 'Unpublish this project' : 'Publish this project'}
                                className={`px-3 py-1 text-xs rounded-full border cursor-pointer transition-colors ${
                                    project.published
                                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                        : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
                                }`}
                            >
                                {project.published ? 'Published' : 'Draft'}
                            </button>
                            <span className="text-sm text-gray-500">
                                {saving ? 'Saving…' : isDirty ? 'Unsaved changes' : 'All changes saved'}
                            </span>
                            <button
                                onClick={() => void remove()}
                                className="text-sm text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                            >
                                Delete
                            </button>
                            <Button
                                onClick={() => void save()}
                                disabled={!isDirty || saving}
                                className={!isDirty || saving ? 'opacity-50 pointer-events-none' : ''}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <section className="bg-gray-900 text-white py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    {!isAdmin && (
                        <Link to="/projects" className="text-sm text-gray-400 hover:text-white transition-colors">
                            ← All projects
                        </Link>
                    )}
                    <InlineText
                        as="h1"
                        value={project.title}
                        editMode={isAdmin}
                        tone="dark"
                        placeholder="Project title"
                        ariaLabel="Project title"
                        className="block mt-3 text-4xl sm:text-5xl font-bold tracking-tight"
                        onChange={title => patch({title})}
                    />
                    <InlineText
                        as="p"
                        value={project.tagline}
                        editMode={isAdmin}
                        tone="dark"
                        multiline
                        rows={2}
                        placeholder="One line on what this is"
                        ariaLabel="Tagline"
                        className="block mt-3 text-lg text-gray-300 leading-relaxed max-w-2xl"
                        onChange={tagline => patch({tagline})}
                    />

                    {(project.technologies.length > 0 || isAdmin) && (
                        <InlineStringList
                            items={project.technologies}
                            editMode={isAdmin}
                            addLabel="Tech"
                            placeholder="Technology"
                            className="mt-5"
                            chipClassName="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700"
                            onChange={technologies => patch({technologies})}
                        />
                    )}

                    {isAdmin ? (
                        <div className="mt-5 flex items-baseline gap-2 text-sm">
                            <span className="text-gray-500 text-xs uppercase tracking-wider shrink-0">Link</span>
                            <InlineText
                                value={project.link ?? ''}
                                editMode
                                tone="dark"
                                placeholder="Leave blank for private projects"
                                ariaLabel="Project link"
                                className="text-accent-400 flex-1 truncate"
                                onChange={link => patch({link})}
                            />
                        </div>
                    ) : project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-accent-700 hover:bg-accent-600 text-sm text-white rounded-lg transition-colors"
                        >
                            View Project <ExternalLink size={16}/>
                        </a>
                    )}
                </div>
            </section>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <ProjectBody
                    blocks={project.body}
                    projectId={project.id}
                    editMode={isAdmin}
                    onChange={body => patch({body})}
                />
            </main>
        </div>
    )
}
