import {useState} from "react";
import type {Experience} from "../../../models/Resume.ts";
import {Button} from "../../SiteComponents/Button.tsx";

interface EditFormProps {
    experience: Experience
    onSave: (updated: Experience) => void
}

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent-400"
const labelClass = "block text-sm font-semibold text-gray-600 mb-1"

export function EditExperienceSectionForm({ experience, onSave }: EditFormProps) {
    const [form, setForm] = useState<Experience>(experience)

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Company</label>
                    <input className={inputClass} value={form.company}
                        onChange={e => setForm({...form, company: e.target.value})} />
                </div>
                <div>
                    <label className={labelClass}>Role</label>
                    <input className={inputClass} value={form.role}
                        onChange={e => setForm({...form, role: e.target.value})} />
                </div>
                <div>
                    <label className={labelClass}>Start Date</label>
                    <input className={inputClass} value={form.startDate}
                        onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div>
                    <label className={labelClass}>End Date</label>
                    <input className={inputClass} value={form.endDate}
                        onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
                <div className="col-span-2">
                    <label className={labelClass}>Location</label>
                    <input className={inputClass} value={form.location ?? ''}
                        onChange={e => setForm({...form, location: e.target.value})} />
                </div>
            </div>
            <div>
                <label className={labelClass}>Bullets (one per line)</label>
                <textarea className={inputClass} rows={4}
                    value={form.bullets.join('\n')}
                    onChange={e => setForm({...form, bullets: e.target.value.split('\n')})} />
            </div>
            <div className="flex justify-end pt-2">
                <Button onClick={() => onSave(form)}>Save</Button>
            </div>
        </div>
    )
}