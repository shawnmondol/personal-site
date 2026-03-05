export interface ContactInfo {
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  website?: string
}

export interface Experience {
  company: string
  role: string
  startDate: string
  endDate: string
  location?: string
  bullets: string[]
}

export interface Education {
  school: string
  degree: string
  field: string
  graduationYear: string
  gpa?: string
}

export interface SkillCategory {
  category: string
  items: string[]
}

export interface Project {
  name: string
  description: string
  technologies: string[]
  link?: string
}

export interface ResumeData {
  name: string
  title: string
  summary: string
  contact: ContactInfo
  experience: Experience[]
  education: Education[]
  skills: SkillCategory[]
  projects: Project[]
}