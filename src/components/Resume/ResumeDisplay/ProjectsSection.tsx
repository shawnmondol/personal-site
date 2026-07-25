import type {Project} from '../../../models/Resume.ts'
import {AnimatePresence, motion} from "framer-motion";
import {InlineText} from "../ResumeEditForms/InlineText.tsx";
import {InlineStringList} from "../ResumeEditForms/InlineStringList.tsx";
import {AddEntryButton, EntryControls} from "../ResumeEditForms/EntryControls.tsx";
import {moveItem, removeAt, updateAt} from "../ResumeEditForms/listUtils.ts";

interface Props {
    projects: Project[]
    editMode?: boolean
    onChange?: (updated: Project[]) => void
}

const emptyProject: Project = {name: '', description: '', technologies: [], link: ''}

const techChipClass = "px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"

export function ProjectsSection({ projects, editMode = false, onChange }: Props) {
  if (!projects.length && !editMode) return null

  function update(index: number, project: Project) {
    onChange?.(updateAt(projects, index, project))
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{opacity: 0, scale: 0.97}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.97}}
              transition={{duration: 0.15}}
              className="group border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <InlineText
                  as="h3"
                  value={project.name}
                  editMode={editMode}
                  placeholder="Project name"
                  ariaLabel="Project name"
                  className="block font-semibold text-gray-800 flex-1"
                  onChange={value => update(i, {...project, name: value})}
                />
                {editMode ? (
                  <EntryControls
                    index={i}
                    total={projects.length}
                    label="project"
                    className="shrink-0 -mt-1"
                    onMove={to => onChange?.(moveItem(projects, i, to))}
                    onRemove={() => onChange?.(removeAt(projects, i))}
                  />
                ) : project.link && (
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

              <InlineText
                as="p"
                value={project.description}
                editMode={editMode}
                multiline
                rows={3}
                placeholder="What is this project?"
                ariaLabel="Project description"
                className="block mt-2 text-sm text-gray-600 leading-relaxed"
                onChange={value => update(i, {...project, description: value})}
              />

              <InlineStringList
                items={project.technologies}
                editMode={editMode}
                chipClassName={techChipClass}
                addLabel="Tech"
                placeholder="Technology"
                className="mt-3"
                onChange={technologies => update(i, {...project, technologies})}
              />

              {editMode && (
                <div className="mt-3 flex items-baseline gap-2 text-sm">
                  <span className="text-gray-400 text-xs uppercase tracking-wider shrink-0">Link</span>
                  <InlineText
                    value={project.link ?? ''}
                    editMode
                    placeholder="https://…"
                    ariaLabel="Project link"
                    className="text-accent-600 flex-1 truncate"
                    onChange={value => update(i, {...project, link: value})}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {editMode && (
        <AddEntryButton className="mt-4" onClick={() => onChange?.([...projects, {...emptyProject}])}>
          Add Project
        </AddEntryButton>
      )}
    </section>
  )
}
