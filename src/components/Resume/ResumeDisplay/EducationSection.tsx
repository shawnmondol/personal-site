import type { Education } from '../../../models/Resume.ts'
import {AnimatePresence, motion} from "framer-motion";
import {InlineText} from "../ResumeEditForms/InlineText.tsx";
import {AddEntryButton, EntryControls} from "../ResumeEditForms/EntryControls.tsx";
import {moveItem, removeAt, updateAt} from "../ResumeEditForms/listUtils.ts";

interface Props {
    education: Education[]
    editMode?: boolean
    onChange?: (updated: Education[]) => void
}

const emptyEducation: Education = {school: '', degree: '', field: '', graduationYear: '', gpa: ''}

export function EducationSection({ education, editMode = false, onChange }: Props) {
  if (!education.length && !editMode) return null

  function update(index: number, entry: Education) {
    onChange?.(updateAt(education, index, entry))
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Education</h2>
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {education.map((edu, i) => (
            <motion.div
              key={i}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.15}}
              className="group flex flex-wrap items-baseline justify-between gap-2"
            >
              <div className={editMode ? 'flex-1 min-w-48' : ''}>
                <InlineText
                  as="h3"
                  value={edu.school}
                  editMode={editMode}
                  placeholder="School"
                  ariaLabel="School"
                  className="block text-lg font-semibold text-gray-800"
                  onChange={value => update(i, {...edu, school: value})}
                />
                {editMode ? (
                  <div className="flex flex-wrap items-baseline gap-1 text-gray-600 text-sm">
                    <InlineText
                      value={edu.degree}
                      editMode
                      placeholder="Degree"
                      ariaLabel="Degree"
                      className="w-32"
                      onChange={value => update(i, {...edu, degree: value})}
                    />
                    <span>in</span>
                    <InlineText
                      value={edu.field}
                      editMode
                      placeholder="Field"
                      ariaLabel="Field of study"
                      className="w-40"
                      onChange={value => update(i, {...edu, field: value})}
                    />
                    <span>· GPA:</span>
                    <InlineText
                      value={edu.gpa ?? ''}
                      editMode
                      placeholder="—"
                      ariaLabel="GPA"
                      className="w-14"
                      onChange={value => update(i, {...edu, gpa: value})}
                    />
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    {edu.degree} in {edu.field}
                    {edu.gpa && ` · GPA: ${edu.gpa}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <InlineText
                  value={edu.graduationYear}
                  editMode={editMode}
                  placeholder="Year"
                  ariaLabel="Graduation year"
                  className={`text-sm text-gray-500 ${editMode ? 'w-20' : ''}`}
                  onChange={value => update(i, {...edu, graduationYear: value})}
                />
                {editMode && (
                  <EntryControls
                    index={i}
                    total={education.length}
                    label="education"
                    onMove={to => onChange?.(moveItem(education, i, to))}
                    onRemove={() => onChange?.(removeAt(education, i))}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {editMode && (
        <AddEntryButton className="mt-4" onClick={() => onChange?.([...education, {...emptyEducation}])}>
          Add Education
        </AddEntryButton>
      )}
    </section>
  )
}
