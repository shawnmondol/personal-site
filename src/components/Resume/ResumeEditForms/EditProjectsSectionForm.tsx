import {useState} from "react";
import type {Project} from "../../../models/Resume.ts";
import {Button} from "../../SiteComponents/Button.tsx";

interface EditFormProps {
    project: Project
    onSave: (updated: Project) => void
}

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent-400"
const labelClass = "block text-sm font-semibold text-gray-600 mb-1"

export function EditProjectsSectionForm({ project, onSave }: EditFormProps) {
    const [form, setForm] = useState<Project>(project)

    function update(updated: Partial<Project>) {
        setForm(prev => ({ ...prev, ...updated }))
    }

    return (
        <div className="space-y-4">
            <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={form.name}
                    onChange={e => update({ name: e.target.value })} />
            </div>
            <div>
                <label className={labelClass}>Description</label>
                <textarea className={inputClass} rows={3} value={form.description}
                    onChange={e => update({ description: e.target.value })} />
            </div>
            <div>
                <label className={labelClass}>Technologies (comma separated)</label>
                <input className={inputClass} value={form.technologies.join(', ')}
                    onChange={e => update({ technologies: e.target.value.split(',').map(t => t.trim()) })} />
            </div>
            <div>
                <label className={labelClass}>Link</label>
                <input className={inputClass} value={form.link ?? ''}
                    onChange={e => update({ link: e.target.value || undefined })} />
            </div>
            <div className="flex justify-end pt-2">
                <Button onClick={() => onSave(form)}>Save</Button>
            </div>
        </div>
    )
}
