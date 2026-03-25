import {useState} from "react";
import type {ContactInfo, ResumeDisplayData} from "../../models/Resume.ts";
import {Button} from "../SiteComponents/Button.tsx";

interface EditFormProps {
    name: string
    title: string
    summary: string
    contact: ContactInfo
    onSave: (updated: Pick<ResumeDisplayData, 'name' | 'title' | 'summary' | 'contact'>) => void
}

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent-400"
const labelClass = "block text-sm font-semibold text-gray-600 mb-1"

export function EditHeroSectionForm({ name, title, summary, contact, onSave }: EditFormProps) {
    const [form, setForm] = useState({name, title, summary, contact})

    return (
        <div className="space-y-4">
            <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={form.name}
                       onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={form.title}
                       onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
                <label className={labelClass}>Summary</label>
                <textarea className={inputClass} rows={4} value={form.summary}
                          onChange={e => setForm({...form, summary: e.target.value})} />
            </div>
            <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} value={form.contact.email ?? ''}
                       onChange={e => setForm({...form, contact: {...form.contact, email: e.target.value}})} />
            </div>
            <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={form.contact.phone ?? ''}
                       onChange={e => setForm({...form, contact: {...form.contact, phone: e.target.value}})} />
            </div>
            <div>
                <label className={labelClass}>Location</label>
                <input className={inputClass} value={form.contact.location ?? ''}
                       onChange={e => setForm({...form, contact: {...form.contact, location: e.target.value}})} />
            </div>
            <div className="flex justify-end pt-2">
                <Button
                    onClick={() => onSave(form)}
                    className="px-4 py-2 text-white text-sm rounded-lg transition-colors"
                >
                    Save
                </Button>
            </div>
        </div>
    )
}