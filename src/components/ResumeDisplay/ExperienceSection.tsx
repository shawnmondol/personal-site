import type { Experience } from '../../models/Resume.ts'
import {PopupModal} from "../SiteComponents/PopupModal.tsx";
import {useState} from "react";
import {EditExperienceSectionForm} from "../ResumeEditForms/EditExperienceSectionForm.tsx";

interface Props {
    experience: Experience[]
    editMode?: boolean
    onChange?: (updated: Experience) => void
}

export function ExperienceSection({ experience, editMode = false }: Props) {
    const [showModal, setShowModal] = useState(false)
    if (!experience.length) return null

    return (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Experience</h2>
          <div className="space-y-8">
            {experience.map((job, i) => (
              <div key={i}
                   className={`relative pl-6 border-l-2 border-accent-200 
                   ${editMode ? 'group hover:bg-accent-100 transition-opacity cursor-pointer' : ''}`}
                   onClick={editMode ? () => setShowModal(true) : undefined}
              >
                <div className="absolute -left-2.25 top-1 w-4 h-4 rounded-full bg-accent-500" />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{job.role}</h3>
                    <p className="text-accent-600 font-medium">{job.company}</p>
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
                        <span className="text-accent-400 mt-0.5">▸</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              <PopupModal isOpen={showModal} onClose={() => setShowModal(false)}>
                  <h2 className="text-xl font-bold mb-6">Edit Hero Details</h2>
                  <EditExperienceSectionForm
                      experience={job}
                      onSave={() => {
                          setShowModal(false)
                      }}
                  />
              </PopupModal>
              </div>
            ))}
          </div>
        </section>
    )
}
