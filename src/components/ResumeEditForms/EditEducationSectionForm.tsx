import {useState} from "react";
import type {Education} from "../../models/Resume.ts";
import {Button} from "../SiteComponents/Button.tsx";

interface EditFormProps {
    education: Education[]
    onSave: (updated: Education[]) => void
}

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent-400"
const labelClass = "block text-sm font-semibold text-gray-600 mb-1"

export function EditEducationSectionForm({ education, onSave }: EditFormProps) {
    const [form, setForm] = useState<Education[]>(education)

    function update(index: number, updated: Education) {
        setForm(prev => prev.map((e, i) => i === index ? updated : e))
    }

    function add() {
        setForm(prev => [...prev, {school: '', degree: '', field: '', graduationYear: ''}])
    }

    function remove(index: number) {
        setForm(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            {form.map((edu, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">{edu.school || `#${i + 1}`}</span>
                        <button onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>School</label>
                            <input className={inputClass} value={edu.school}
                                onChange={e => update(i, {...edu, school: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Degree</label>
                            <input className={inputClass} value={edu.degree}
                                onChange={e => update(i, {...edu, degree: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Field</label>
                            <input className={inputClass} value={edu.field}
                                onChange={e => update(i, {...edu, field: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Graduation Year</label>
                            <input className={inputClass} value={edu.graduationYear}
                                onChange={e => update(i, {...edu, graduationYear: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>GPA</label>
                            <input className={inputClass} value={edu.gpa ?? ''}
                                onChange={e => update(i, {...edu, gpa: e.target.value})} />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={add} className="text-sm text-accent-500 hover:text-accent-700">+ Add Education</button>
            <div className="flex justify-end pt-2">
                <Button onClick={() => onSave(form)}>Save</Button>
            </div>
        </div>
    )
}