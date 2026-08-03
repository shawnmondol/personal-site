import type {ResumeDisplayData} from '../../../models/Resume.ts'
import {Link} from "react-router-dom";
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
  function patch(updates: Partial<HeroFields>) {
    onChange?.({ name, title, summary, contact, ...updates })
  }

  return (
    <section style={{padding: '88px 0 40px'}}>
      <InlineText
        as="h1"
        value={name}
        editMode={editMode}
        placeholder="Your name"
        ariaLabel="Name"
        className="block"
        onChange={value => patch({name: value})}
      />

      <InlineText
        as="p"
        value={title}
        editMode={editMode}
        placeholder="Professional headline"
        ariaLabel="Title"
        className="block font-heading text-accent-300 text-[19px] mt-2.5"
        onChange={value => patch({title: value})}
      />

      {(contact.location || editMode) && (
        <InlineText
          as="p"
          value={contact.location ?? ''}
          editMode={editMode}
          placeholder="Location"
          ariaLabel="Location"
          className="block text-muted text-[13px] mt-1.5"
          onChange={value => patch({contact: {...contact, location: value}})}
        />
      )}

      <InlineText
        as="p"
        value={summary}
        editMode={editMode}
        multiline
        rows={5}
        placeholder="Professional summary"
        ariaLabel="Summary"
        className="block text-body text-base leading-relaxed mt-6 max-w-[60ch]"
        onChange={value => patch({summary: value})}
      />

      <div className="flex flex-wrap gap-2.5 mt-7 items-center">
        {editMode ? (
          <>
            <span className="text-muted text-xs uppercase tracking-wider">Email</span>
            <InlineText
              value={contact.email ?? ''}
              editMode
              placeholder="Email"
              ariaLabel="Email"
              className="text-accent-300 text-sm"
              onChange={value => patch({contact: {...contact, email: value}})}
            />
            <span className="text-muted text-xs uppercase tracking-wider ml-4">Phone</span>
            <InlineText
              value={contact.phone ?? ''}
              editMode
              placeholder="Phone"
              ariaLabel="Phone"
              className="text-accent-300 text-sm"
              onChange={value => patch({contact: {...contact, phone: value}})}
            />
          </>
        ) : (
          <>
            {contact.email && (
              <a href={`mailto:${contact.email}`}><span className="btn btn-primary">{contact.email}</span></a>
            )}
            {import.meta.env.VITE_GITHUB && (
              <a href={import.meta.env.VITE_GITHUB} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">GitHub</a>
            )}
            {import.meta.env.VITE_LINKEDIN && (
              <a href={import.meta.env.VITE_LINKEDIN} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            )}
            {import.meta.env.VITE_GITLAB && (
              <a href={import.meta.env.VITE_GITLAB} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">GitLab</a>
            )}
            {fileUrl && (
              <a href={fileUrl} download className="btn btn-secondary" target="_blank" rel="noopener noreferrer">Resume ↗</a>
            )}
          </>
        )}
      </div>
    </section>
  )
}
