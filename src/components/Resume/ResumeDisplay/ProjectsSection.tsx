import type {Project, ResumeDisplayData} from '../../../models/Resume.ts'
import {PopupModal} from "../../SiteComponents/PopupModal.tsx";
import {useState} from "react";
import {EditProjectsSectionForm} from "../ResumeEditForms/EditProjectsSectionForm.tsx";

interface Props {
    projects: Project[]
    editMode?: boolean
    onChange?: (updated: Pick<ResumeDisplayData, 'projects'>) => void
}

export function ProjectsSection({ projects, editMode = false, onChange }: Props) {
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  function handleEdit(project: Project, index: number) {
    setEditingProject(project)
    setEditingIndex(index)
  }

  function handleAdd() {
    setEditingProject({ name: '', description: '', technologies: [] })
    setEditingIndex(null)
  }

  function handleSave(updated: Project) {
    if (editingIndex === null) {
      onChange?.({ projects: [...projects, updated] })
    } else {
      onChange?.({ projects: projects.map((p, i) => i === editingIndex ? updated : p) })
    }
    setEditingProject(null)
    setEditingIndex(null)
  }

  if (!projects.length && !editMode) return null

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project, i) => (
          <div key={i}
               className={`border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow
               ${editMode ? "cursor-pointer" : ""}`}
               onClick={editMode ? () => handleEdit(project, i) : undefined}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-800">{project.name}</h3>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-500 hover:text-accent-700 text-sm shrink-0"
                >
                  ↗ Link
                </a>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.technologies.map((tech, j) => (
                <span
                  key={j}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={handleAdd} className="mt-4 text-sm text-accent-500 hover:text-accent-700 cursor-pointer transition-colors">
          + Add Project
        </button>
      )}
        <PopupModal isOpen={editingProject !== null} onClose={() => setEditingProject(null)}>
            <h2 className="text-xl font-bold mb-6">{editingIndex === null ? 'Add Project' : 'Edit Project'}</h2>
            {editingProject && (
                <EditProjectsSectionForm
                    project={editingProject}
                    onSave={handleSave}
                />
            )}
        </PopupModal>
    </section>
  )
}
