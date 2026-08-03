import type {ResumeDisplayData} from '../../../models/Resume.ts'
import {ExternalLink} from "lucide-react";
import {InlineText} from "../ResumeEditForms/InlineText.tsx";

type HeroFields = Pick<ResumeDisplayData, 'name' | 'title' | 'summary' | 'contact'>

interface Props {
  name: ResumeDisplayData['name']
  title: ResumeDisplayData['title']
  summary: ResumeDisplayData['summary']
  contact: ResumeDisplayData['contact']
  fileUrl?: string
  editMode?: boolean
  onChange?: (updated: HeroFields) => void
}

export function HeroSection({ name, title, summary, contact, fileUrl, editMode = false, onChange }: Props) {
  const links = [
    contact.email && { label: contact.email, href: `mailto:${contact.email}` },
    import.meta.env.VITE_GITHUB && { label: 'GitHub', href: import.meta.env.VITE_GITHUB },
    import.meta.env.VITE_LINKEDIN && { label: 'LinkedIn', href: import.meta.env.VITE_LINKEDIN },
  ].filter(Boolean) as { label: string; href: string }[]

  function patch(updates: Partial<HeroFields>) {
    onChange?.({ name, title, summary, contact, ...updates })
  }

  return (
    <section className="relative bg-gray-900 text-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <InlineText
          as="h1"
          value={name}
          editMode={editMode}
          tone="dark"
          placeholder="Your name"
          ariaLabel="Name"
          className="block text-5xl font-bold tracking-tight"
          onChange={value => patch({name: value})}
        />
        <InlineText
          as="p"
          value={title}
          editMode={editMode}
          tone="dark"
          placeholder="Professional headline"
          ariaLabel="Title"
          className="block mt-2 text-xl text-accent-400 font-medium"
          onChange={value => patch({title: value})}
        />

        {(contact.location || editMode) && (
          <InlineText
            as="p"
            value={contact.location ?? ''}
            editMode={editMode}
            tone="dark"
            placeholder="Location"
            ariaLabel="Location"
            className="block mt-1 text-gray-400 text-sm"
            onChange={value => patch({contact: {...contact, location: value}})}
          />
        )}

        <InlineText
          as="p"
          value={summary}
          editMode={editMode}
          tone="dark"
          multiline
          rows={4}
          placeholder="Professional summary"
          ariaLabel="Summary"
          className="block mt-6 text-gray-300 leading-relaxed max-w-2xl"
          onChange={value => patch({summary: value})}
        />

        {editMode && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-2xl">
            <label className="text-sm">
              <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Email</span>
              <InlineText
                value={contact.email ?? ''}
                editMode
                tone="dark"
                placeholder="Email"
                ariaLabel="Email"
                className="block text-gray-300"
                onChange={value => patch({contact: {...contact, email: value}})}
              />
            </label>
            <label className="text-sm">
              <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Phone</span>
              <InlineText
                value={contact.phone ?? ''}
                editMode
                tone="dark"
                placeholder="Phone"
                ariaLabel="Phone"
                className="block text-gray-300"
                onChange={value => patch({contact: {...contact, phone: value}})}
              />
            </label>
          </div>
        )}

        {!editMode && (links.length > 0 || fileUrl) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 hover:bg-accent-700 text-sm text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            {fileUrl && (
              <a
                href={fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-accent-700 hover:bg-accent-600 text-sm text-white rounded-lg transition-colors"
              >
                View Resume <ExternalLink className={"inline-block"} size={16} />
              </a>
            )}
            <a
                href="/projects"
                className="px-4 py-2 bg-accent-700 hover:bg-accent-600 text-sm text-white rounded-lg transition-colors"
            >
              Projects
            </a>
            <a
                href="/about-me"
                className="px-4 py-2 bg-accent-700 hover:bg-accent-600 text-sm text-white rounded-lg transition-colors"
            >
              About Me
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
