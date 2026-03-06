import type { Experience } from '../../types/Resume.ts'

interface Props {
  experience: Experience[]
}

export function ExperienceSection({ experience }: Props) {
  if (!experience.length) return null

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Experience</h2>
      <div className="space-y-8">
        {experience.map((job, i) => (
          <div key={i} className="relative pl-6 border-l-2 border-blue-200">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500" />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{job.role}</h3>
                <p className="text-blue-600 font-medium">{job.company}</p>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {job.startDate} – {job.endDate}
                {job.location && ` · ${job.location}`}
              </span>
            </div>
            {job.bullets.length > 0 && (
              <ul className="mt-3 space-y-1">
                {job.bullets.map((bullet, j) => (
                  <li key={j} className="text-gray-600 text-sm flex gap-2">
                    <span className="text-blue-400 mt-0.5">▸</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
