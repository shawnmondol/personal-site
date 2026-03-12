import {useState} from "react";
import type {Project} from "../../models/Resume.ts";
import {Button} from "../SiteComponents/Button.tsx";

interface EditFormProps {
    projects: Project[]
    onSave: (updated: Project[]) => void
}

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
const labelClass = "block text-sm font-semibold text-gray-600 mb-1"

export function EditProjectsSectionForm({ projects, onSave }: EditFormProps) {
    const [form, setForm] = useState<Project[]>(projects)

    function update(index: number, updated: Project) {
        setForm(prev => prev.map((p, i) => i === index ? updated : p))
    }

    function add() {
        setForm(prev => [...prev, {name: '', description: '', technologies: []}])
    }

    function remove(index: number) {
        setForm(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            {form.map((project, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">{project.name || `#${i + 1}`}</span>
                        <button onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                    <div>
                        <label className={labelClass}>Name</label>
                        <input className={inputClass} value={project.name}
                            onChange={e => update(i, {...project, name: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea className={inputClass} rows={3} value={project.description}
                            onChange={e => update(i, {...project, description: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Technologies (comma separated)</label>
                        <input className={inputClass} value={project.technologies.join(', ')}
                            onChange={e => update(i, {...project, technologies: e.target.value.split(',').map(t => t.trim())})} />
                    </div>
                    <div>
                        <label className={labelClass}>Link</label>
                        <input className={inputClass} value={project.link ?? ''}
                            onChange={e => update(i, {...project, link: e.target.value})} />
                    </div>
                </div>
            ))}
            <button onClick={add} className="text-sm text-blue-500 hover:text-blue-700">+ Add Project</button>
            <div className="flex justify-end pt-2">
                <Button onClick={() => onSave(form)}>Save</Button>
            </div>
        </div>
    )
}