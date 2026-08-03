export type ProjectBlock =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'list'; items: string[] }
  | { id: string; type: 'image'; url: string; caption: string }
  | { id: string; type: 'code'; code: string }

export type ProjectBlockType = ProjectBlock['type']

export interface Project {
  /** Doc id, also the URL slug. */
  id: string
  title: string
  tagline: string
  technologies: string[]
  /** Omitted for private projects — the page simply renders no link. */
  link?: string
  published: boolean
  body: ProjectBlock[]
  /** Epoch millis, so ordering needs no Timestamp conversion. */
  createdAt: number
  updatedAt: number
}

export function makeBlock(type: ProjectBlockType): ProjectBlock {
  const id = crypto.randomUUID()
  switch (type) {
    case 'heading': return { id, type, text: '' }
    case 'paragraph': return { id, type, text: '' }
    case 'list': return { id, type, items: [] }
    case 'image': return { id, type, url: '', caption: '' }
    case 'code': return { id, type, code: '' }
  }
}
