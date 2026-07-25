import type { Experience } from '../../../models/Resume.ts'
import {AnimatePresence, motion} from "framer-motion";
import {InlineText} from "../ResumeEditForms/InlineText.tsx";
import {InlineStringList} from "../ResumeEditForms/InlineStringList.tsx";
import {AddEntryButton, EntryControls} from "../ResumeEditForms/EntryControls.tsx";
import {moveItem, removeAt, updateAt} from "../ResumeEditForms/listUtils.ts";

interface Props {
    experience: Experience[]
    editMode?: boolean
    onChange?: (updated: Experience[]) => void
}

const emptyJob: Experience = {company: '', role: '', startDate: '', endDate: '', location: '', bullets: []}

export function ExperienceSection({ experience, editMode = false, onChange }: Props) {
    if (!experience.length && !editMode) return null

    function update(index: number, job: Experience) {
        onChange?.(updateAt(experience, index, job))
    }

    return (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Experience</h2>
          <div className="space-y-8">
            <AnimatePresence initial={false}>
              {experience.map((job, i) => (
                <motion.div
                  key={i}
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                  transition={{duration: 0.15}}
                  className={`group relative pl-6 border-l-2 border-accent-200 ${editMode ? 'pr-2' : ''}`}
                >
                  <div className="absolute -left-2.25 top-1 w-4 h-4 rounded-full bg-accent-500" />

                  {editMode && (
                    <EntryControls
                      index={i}
                      total={experience.length}
                      label="experience"
                      className="absolute -top-1 right-0"
                      onMove={to => onChange?.(moveItem(experience, i, to))}
                      onRemove={() => onChange?.(removeAt(experience, i))}
                    />
                  )}

                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className={editMode ? 'flex-1 min-w-48' : ''}>
                      <InlineText
                        as="h3"
                        value={job.role}
                        editMode={editMode}
                        placeholder="Role"
                        ariaLabel="Role"
                        className="block text-lg font-semibold text-gray-800"
                        onChange={value => update(i, {...job, role: value})}
                      />
                      <InlineText
                        as="p"
                        value={job.company}
                        editMode={editMode}
                        placeholder="Company"
                        ariaLabel="Company"
                        className="block text-accent-600 font-medium"
                        onChange={value => update(i, {...job, company: value})}
                      />
                    </div>
                    {editMode ? (
                      <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
                        <InlineText
                          value={job.startDate}
                          editMode
                          placeholder="Start"
                          ariaLabel="Start date"
                          className="w-24"
                          onChange={value => update(i, {...job, startDate: value})}
                        />
                        <span>–</span>
                        <InlineText
                          value={job.endDate}
                          editMode
                          placeholder="End"
                          ariaLabel="End date"
                          className="w-24"
                          onChange={value => update(i, {...job, endDate: value})}
                        />
                        <span>·</span>
                        <InlineText
                          value={job.location ?? ''}
                          editMode
                          placeholder="Location"
                          ariaLabel="Location"
                          className="w-28"
                          onChange={value => update(i, {...job, location: value})}
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {job.startDate} – {job.endDate}
                        {job.location && ` · ${job.location}`}
                      </span>
                    )}
                  </div>

                  <InlineStringList
                    items={job.bullets}
                    editMode={editMode}
                    variant="bullet"
                    addLabel="Add bullet"
                    placeholder="Describe an accomplishment"
                    onChange={bullets => update(i, {...job, bullets})}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {editMode && (
            <AddEntryButton
              className="mt-6"
              onClick={() => onChange?.([...experience, {...emptyJob}])}
            >
              Add Experience
            </AddEntryButton>
          )}
        </section>
    )
}
