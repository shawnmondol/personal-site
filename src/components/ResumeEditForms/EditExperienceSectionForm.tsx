import {useState} from "react";
import type {Experience} from "../../models/Resume.ts";
import {Button} from "../SiteComponents/Button.tsx";

interface EditFormProps {
    experience: Experience[]
    onSave: (updated: Experience[]) => void
}

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
const labelClass = "block text-sm font-semibold text-gray-600 mb-1"

export function EditExperienceSectionForm({ experience, onSave }: EditFormProps) {
    const [form, setForm] = useState<Experience[]>(experience)

    function update(index: number, updated: Experience) {
        setForm(prev => prev.map((e, i) => i === index ? updated : e))
    }

    function add() {
        setForm(prev => [...prev, {company: '', role: '', startDate: '', endDate: '', bullets: []}])
    }

    function remove(index: number) {
        setForm(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            {form.map((exp, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">{exp.company || `#${i + 1}`}</span>
                        <button onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Company</label>
                            <input className={inputClass} value={exp.company}
                                onChange={e => update(i, {...exp, company: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Role</label>
                            <input className={inputClass} value={exp.role}
                                onChange={e => update(i, {...exp, role: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Start Date</label>
                            <input className={inputClass} value={exp.startDate}
                                onChange={e => update(i, {...exp, startDate: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>End Date</label>
                            <input className={inputClass} value={exp.endDate}
                                onChange={e => update(i, {...exp, endDate: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>Location</label>
                            <input className={inputClass} value={exp.location ?? ''}
                                onChange={e => update(i, {...exp, location: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Bullets (one per line)</label>
                        <textarea className={inputClass} rows={4}
                            value={exp.bullets.join('\n')}
                            onChange={e => update(i, {...exp, bullets: e.target.value.split('\n')})} />
                    </div>
                </div>
            ))}
            <button onClick={add} className="text-sm text-blue-500 hover:text-blue-700">+ Add Experience</button>
            <div className="flex justify-end pt-2">
                <Button onClick={() => onSave(form)}>Save</Button>
            </div>
        </div>
    )
}