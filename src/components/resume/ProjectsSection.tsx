import type { Project } from '../../models/Resume.ts'

interface Props {
  projects: Project[]
}

export function ProjectsSection({ projects }: Props) {
  if (!projects.length) return null

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-800">{project.name}</h3>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm shrink-0"
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
    </section>
  )
}
