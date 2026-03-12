import type { Education } from '../../models/Resume.ts'
import {Button} from "../SiteComponents/Button.tsx";

interface Props {
    education: Education[]
    editMode?: boolean
}

export function EducationSection({ education, editMode = false }: Props) {
  if (!education.length) return null

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Education</h2>
      <div className="space-y-4">
        {education.map((edu, i) => (
          <div key={i} className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{edu.school}</h3>
              <p className="text-gray-600 text-sm">
                {edu.degree} in {edu.field}
                {edu.gpa && ` · GPA: ${edu.gpa}`}
              </p>
            </div>
            <span className="text-sm text-gray-500">{edu.graduationYear}</span>
          </div>
        ))}
      </div>
        {editMode && (
            <Button onClick={() => {}} className="mt-4">Edit</Button>
        )}
    </section>
  )
}
