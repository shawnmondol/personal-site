import type { SkillCategory } from '../../types/resume'

interface Props {
  skills: SkillCategory[]
}

export function SkillsSection({ skills }: Props) {
  if (!skills.length) return null

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Skills</h2>
      <div className="space-y-4">
        {skills.map((group, i) => (
          <div key={i}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((skill, j) => (
                <span
                  key={j}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
