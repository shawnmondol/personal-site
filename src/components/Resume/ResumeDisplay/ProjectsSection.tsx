import type {Project} from '../../../models/Resume.ts'
import {Link} from "react-router-dom";
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

export function ProjectsSection({ projects, editMode = false, onChange }: Props) {
  if (!projects.length && !editMode) return null

  function update(index: number, project: Project) {
    onChange?.(updateAt(projects, index, project))
  }

  return (
    <section className="section-rule" style={{padding: '40px 0 88px'}}>
      <div className="flex justify-between items-baseline gap-4 mb-5">
        <h2>Projects</h2>
        <Link to="/projects" className="text-sm whitespace-nowrap">View all →</Link>
      </div>

      <div
        className="grid gap-[18px]"
        style={{gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'}}
      >
        <AnimatePresence initial={false}>
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{opacity: 0, scale: 0.98}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.98}}
              transition={{duration: 0.15}}
              className="card elev-sm group relative"
              style={{padding: 18}}
            >
              <div className="flex items-start justify-between gap-2">
                <InlineText
                  as="h3"
                  value={project.name}
                  editMode={editMode}
                  placeholder="Project name"
                  ariaLabel="Project name"
                  className="card-title flex-1"
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
                    className="text-xs shrink-0"
                  >
                    ↗
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
                className="card-body"
                onChange={value => update(i, {...project, description: value})}
              />

              <InlineStringList
                items={project.technologies}
                editMode={editMode}
                addLabel="Tech"
                placeholder="Technology"
                className="mt-1"
                onChange={technologies => update(i, {...project, technologies})}
              />

              {editMode && (
                <div className="flex items-baseline gap-2 text-xs mt-1">
                  <span className="text-muted uppercase tracking-wider shrink-0">Link</span>
                  <InlineText
                    value={project.link ?? ''}
                    editMode
                    placeholder="Leave blank if private"
                    ariaLabel="Project link"
                    className="text-accent-300 flex-1 truncate"
                    onChange={value => update(i, {...project, link: value})}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {editMode && (
        <AddEntryButton className="mt-5" onClick={() => onChange?.([...projects, {...emptyProject}])}>
          Add Project
        </AddEntryButton>
      )}
    </section>
  )
}
