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
        <section className="section-rule" style={{padding: '40px 0'}}>
          <h2 className="mb-6">Experience</h2>

          <AnimatePresence initial={false}>
            {experience.map((job, i) => (
              <motion.div
                key={i}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.15}}
                className="group relative section-rule"
                style={{padding: '22px 0'}}
              >
                {editMode && (
                  <EntryControls
                    index={i}
                    total={experience.length}
                    label="experience"
                    className="absolute top-3 right-0 z-10"
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
                      className="block text-[17px] font-semibold"
                      onChange={value => update(i, {...job, role: value})}
                    />
                    <InlineText
                      as="p"
                      value={job.company}
                      editMode={editMode}
                      placeholder="Company"
                      ariaLabel="Company"
                      className="block text-sm text-accent-300 mt-1"
                      onChange={value => update(i, {...job, company: value})}
                    />
                  </div>
                  {editMode ? (
                    <div className="flex items-center gap-1 text-xs text-muted shrink-0 mr-20">
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
                    <span className="text-xs text-muted whitespace-nowrap">
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
                  className="mt-3!"
                  onChange={bullets => update(i, {...job, bullets})}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {editMode && (
            <AddEntryButton className="mt-5" onClick={() => onChange?.([...experience, {...emptyJob}])}>
              Add Experience
            </AddEntryButton>
          )}
        </section>
    )
}
