import type { SkillCategory } from '../../../models/Resume.ts'
import {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";

const Key = {
    Enter: 'Enter',
    Escape: 'Escape',
} as const

interface Props {
    skills: SkillCategory[]
    editMode?: boolean
    onChange?: (updated: SkillCategory[]) => void
}

export function SkillsSection({ skills, editMode = false, onChange }: Props) {
  const [editing, setEditing] = useState<{group: number, skill: number} | null>(null)
  const [editValue, setEditValue] = useState('')

  if (!skills.length) return null

  function startEdit(groupIndex: number, skillIndex: number, current: string) {
    setEditing({group: groupIndex, skill: skillIndex})
    setEditValue(current)
  }

  function commitEdit(groupIndex: number, skillIndex: number) {
    if (!onChange) return
    const updated = skills.map((group, gi) => {
      if (gi !== groupIndex) return group
      const items = group.items.map((item, si) => si === skillIndex ? editValue.trim() || item : item)
      return {...group, items}
    })
    onChange(updated)
    setEditing(null)
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Skills</h2>
      <div className="space-y-4">
        {skills.map((group, gi) => (
          <div key={gi}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence initial={false}>
                {group.items.map((skill, si) => {
                  const isEditing = editing?.group === gi && editing?.skill === si
                  if (editMode && isEditing) {
                    return (
                      <motion.div
                        key={skill + si}
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.8}}
                      >
                        <input
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(gi, si)}
                          onKeyDown={e => {
                            if (e.key === Key.Enter) commitEdit(gi, si)
                            if (e.key === Key.Escape) setEditing(null)
                          }}
                          className="px-3 py-1 text-sm rounded-full border border-accent-400 bg-accent-50 text-accent-700 outline-none w-32"
                        />
                      </motion.div>
                    )
                  }
                  return (
                    <motion.span
                      key={skill + si}
                      initial={{opacity: 0, scale: 0.8}}
                      animate={{opacity: 1, scale: 1}}
                      exit={{opacity: 0, scale: 0.8}}
                      transition={{duration: 0.15}}
                      onClick={() => editMode && startEdit(gi, si, skill)}
                      className={`px-3 py-1 bg-accent-50 text-accent-700 text-sm rounded-full border border-accent-100 inline-flex items-center gap-1 ${editMode ? 'cursor-pointer hover:border-accent-400 hover:bg-accent-100' : ''}`}
                    >
                      {skill}
                      {editMode && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            if (!onChange) return
                            onChange(skills.map((g, i) =>
                              i === gi ? {...g, items: g.items.filter((_, j) => j !== si)} : g
                            ))
                          }}
                          className="text-accent-400 hover:text-red-500 leading-none transition-colors cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </motion.span>
                  )
                })}
              </AnimatePresence>
              {editMode && (
                <button
                  onClick={() => {
                    if (!onChange) return
                    onChange(skills.map((group, i) =>
                      i === gi ? {...group, items: [...group.items, 'New Skill']} : group
                    ))
                    startEdit(gi, group.items.length, 'New Skill')
                  }}
                  className="px-3 py-1 bg-accent-50 text-accent-400 text-sm rounded-full border border-dashed border-accent-300 hover:border-accent-400 hover:text-accent-600 transition-colors cursor-pointer"
                >
                  Add +
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}