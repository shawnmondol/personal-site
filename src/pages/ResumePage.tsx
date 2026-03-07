import { useNavigate } from 'react-router-dom'
import { useResume } from '../context/ResumeContext'
import { HeroSection } from '../components/resume/HeroSection'
import { ExperienceSection } from '../components/resume/ExperienceSection'
import { SkillsSection } from '../components/resume/SkillsSection'
import { EducationSection } from '../components/resume/EducationSection'
import { ProjectsSection } from '../components/resume/ProjectsSection'
import {saveResume} from "../services/resume/firestoreResumeService.ts";

export function ResumePage() {
  const { resume, clearResume } = useResume()
  const navigate = useNavigate()

  if (!resume) {
    navigate('/')
    return null
  }

  function handleClear() {
    clearResume()
    navigate('/')
  }

  function handleSave() {
      saveResume(resume!)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        name={resume.name}
        title={resume.title}
        summary={resume.summary}
        contact={resume.contact}
      />

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-14">
        <ExperienceSection experience={resume.experience} />
        <SkillsSection skills={resume.skills} />
        <ProjectsSection projects={resume.projects} />
        <EducationSection education={resume.education} />
      </main>

      <footer className="text-center pb-10">
        <button
          onClick={handleClear}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Upload a different resume
        </button>
          <button
          onClick={handleSave}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Save Resume
          </button>
      </footer>
    </div>
  )
}
