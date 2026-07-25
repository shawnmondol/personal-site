import type { SkillCategory } from '../../../models/Resume.ts'
import {AnimatePresence, motion} from "framer-motion";
import {InlineText} from "../ResumeEditForms/InlineText.tsx";
import {InlineStringList} from "../ResumeEditForms/InlineStringList.tsx";
import {AddEntryButton, EntryControls} from "../ResumeEditForms/EntryControls.tsx";
import {moveItem, removeAt, updateAt} from "../ResumeEditForms/listUtils.ts";

interface Props {
    skills: SkillCategory[]
    editMode?: boolean
    onChange?: (updated: SkillCategory[]) => void
}

const emptyCategory: SkillCategory = {category: '', items: []}

export function SkillsSection({ skills, editMode = false, onChange }: Props) {
  if (!skills.length && !editMode) return null

  function update(index: number, group: SkillCategory) {
    onChange?.(updateAt(skills, index, group))
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Skills</h2>
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {skills.map((group, gi) => (
            <motion.div
              key={gi}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.15}}
              className="group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <InlineText
                  as="h3"
                  value={group.category}
                  editMode={editMode}
                  placeholder="Category"
                  ariaLabel="Skill category"
                  className="block text-sm font-semibold text-gray-500 uppercase tracking-wider"
                  onChange={value => update(gi, {...group, category: value})}
                />
                {editMode && (
                  <EntryControls
                    index={gi}
                    total={skills.length}
                    label="category"
                    className="shrink-0"
                    onMove={to => onChange?.(moveItem(skills, gi, to))}
                    onRemove={() => onChange?.(removeAt(skills, gi))}
                  />
                )}
              </div>
              <InlineStringList
                items={group.items}
                editMode={editMode}
                addLabel="Add"
                placeholder="Skill"
                onChange={items => update(gi, {...group, items})}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {editMode && (
        <AddEntryButton className="mt-4" onClick={() => onChange?.([...skills, {...emptyCategory, items: []}])}>
          Add Category
        </AddEntryButton>
      )}
    </section>
  )
}
