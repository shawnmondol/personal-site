import type { ResumeDisplayData} from '../../models/Resume.ts'
import {PopupModal} from "../SiteComponents/PopupModal.tsx";
import {useState} from "react";
import {EditHeroSectionForm} from "../ResumeEditForms/EditHeroSectionForm.tsx";

interface Props {
  name: ResumeDisplayData['name']
  title: ResumeDisplayData['title']
  summary: ResumeDisplayData['summary']
  contact: ResumeDisplayData['contact']
  editMode?: boolean
  onChange?: (updated: Pick<ResumeDisplayData, 'name' | 'title' | 'summary' | 'contact'>) => void
}

export function HeroSection({ name, title, summary, contact, editMode = false, onChange }: Props) {
  const links = [
    contact.email && { label: contact.email, href: `mailto:${contact.email}` },
    import.meta.env.VITE_GITHUB && { label: 'GitHub', href: import.meta.env.VITE_GITHUB },
    import.meta.env.VITE_LINKEDIN && { label: 'LinkedIn', href: import.meta.env.VITE_LINKEDIN },
  ].filter(Boolean) as { label: string; href: string }[]

  const [showModal, setShowModal] = useState(false)

  return (
    <section
        className={`relative bg-gray-900 text-white py-20 px-6 ${editMode ? 'group hover:opacity-75 transition-opacity cursor-pointer' : ''}`}
        onClick={editMode ? () => setShowModal(true) : undefined}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight">{name}</h1>
        <p className="mt-2 text-xl text-blue-400 font-medium">{title}</p>

        {contact.location && (
          <p className="mt-1 text-gray-400 text-sm">{contact.location}</p>
        )}

        <p className="mt-6 text-gray-300 leading-relaxed max-w-2xl">{summary}</p>

        {editMode && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-5xl text-white font-light">+</span>
          </div>
        )}

        {links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 hover:bg-blue-600 text-sm text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <PopupModal isOpen={showModal} onClose={() => setShowModal(false)}>
          <h2 className="text-xl font-bold mb-6">Edit Hero Details</h2>
          <EditHeroSectionForm
            name={name}
            title={title}
            summary={summary}
            contact={contact}
            onSave={updated => {
              onChange?.(updated)
              setShowModal(false)
            }}
          />
        </PopupModal>
      </div>
    </section>
  )
}