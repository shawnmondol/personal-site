import type { ResumeData } from '../../types/resume'

interface Props {
  name: ResumeData['name']
  title: ResumeData['title']
  summary: ResumeData['summary']
  contact: ResumeData['contact']
}

export function HeroSection({ name, title, summary, contact }: Props) {
  const links = [
    contact.email && { label: contact.email, href: `mailto:${contact.email}` },
    contact.github && { label: 'GitHub', href: contact.github },
    contact.linkedin && { label: 'LinkedIn', href: contact.linkedin },
    contact.website && { label: 'Website', href: contact.website },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <section className="bg-gray-900 text-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight">{name}</h1>
        <p className="mt-2 text-xl text-blue-400 font-medium">{title}</p>

        {contact.location && (
          <p className="mt-1 text-gray-400 text-sm">{contact.location}</p>
        )}

        <p className="mt-6 text-gray-300 leading-relaxed max-w-2xl">{summary}</p>

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
      </div>
    </section>
  )
}
