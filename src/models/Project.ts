export type ProjectBlock =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'list'; items: string[] }
  | { id: string; type: 'image'; url: string; caption: string }
  | { id: string; type: 'code'; code: string }

export type ProjectBlockType = ProjectBlock['type']

/** The project's cover: a hero-sized render plus a thumbnail for the card grid. */
export interface ProjectCover {
  url: string
  thumb?: string
  /** Width ÷ height of the crop, so the hero renders exactly what was framed. */
  aspect?: number
}

/** Covers stored before cropping existed fall back to the old fixed-height hero. */
export const DEFAULT_COVER_HEIGHT = 420

/** Covers stored before thumbnails existed only carry `url`. */
export function coverThumb(cover: ProjectCover): string {
  return cover.thumb ?? cover.url
}

export interface Project {
  /** Doc id, also the URL slug. */
  id: string
  title: string
  tagline: string
  technologies: string[]
  /** Omitted for private projects — the page simply renders no link. */
  link?: string
  /** Omitted until one is uploaded; the card falls back to a gradient. */
  cover?: ProjectCover
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
