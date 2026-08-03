import {useRef, useState} from "react";
import {toast} from "sonner";
import {AnimatePresence, motion} from "framer-motion";
import {Code, Heading, Image as ImageIcon, List, Text} from "lucide-react";
import type {ProjectBlock, ProjectBlockType} from "../../models/Project.ts";
import {makeBlock} from "../../models/Project.ts";
import {deleteProjectImage, uploadProjectImage} from "../../services/projects/firestoreProjectService.ts";
import {InlineText} from "../Resume/ResumeEditForms/InlineText.tsx";
import {InlineStringList} from "../Resume/ResumeEditForms/InlineStringList.tsx";
import {EntryControls} from "../Resume/ResumeEditForms/EntryControls.tsx";
import {moveItem, removeAt, updateAt} from "../Resume/ResumeEditForms/listUtils.ts";

interface Props {
    blocks: ProjectBlock[]
    projectId: string
    editMode?: boolean
    onChange?: (blocks: ProjectBlock[]) => void
}

const addOptions: { type: Exclude<ProjectBlockType, 'image'>; label: string; icon: typeof Text }[] = [
    {type: 'heading', label: 'Heading', icon: Heading},
    {type: 'paragraph', label: 'Text', icon: Text},
    {type: 'list', label: 'List', icon: List},
    {type: 'code', label: 'Code', icon: Code},
]

const codeClass = "font-mono text-sm whitespace-pre"

const codePanelStyle = {
    background: 'color-mix(in srgb, black 35%, var(--color-surface))',
    border: '1px solid var(--color-divider)',
}

export function ProjectBody({blocks, projectId, editMode = false, onChange}: Props) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const targetRef = useRef<string | null>(null)

    function update(index: number, block: ProjectBlock) {
        onChange?.(updateAt(blocks, index, block))
    }

    function remove(index: number) {
        const block = blocks[index]
        if (block.type === 'image' && block.url) void deleteProjectImage(block.url)
        onChange?.(removeAt(blocks, index))
    }

    /** `target` is a block id to replace the image of, or null to append a new image block. */
    function pickImage(target: string | null) {
        targetRef.current = target
        fileInputRef.current?.click()
    }

    async function handleFile(file: File) {
        const target = targetRef.current
        targetRef.current = null
        setUploading(true)
        try {
            const url = await uploadProjectImage(file, projectId)
            if (target === null) {
                onChange?.([...blocks, {id: crypto.randomUUID(), type: 'image', url, caption: ''}])
            } else {
                const previous = blocks.find(b => b.id === target)
                if (previous?.type === 'image' && previous.url) void deleteProjectImage(previous.url)
                onChange?.(blocks.map(b => b.id === target && b.type === 'image' ? {...b, url} : b))
            }
        } catch (error) {
            console.error(error)
            toast.error('Image upload failed')
        } finally {
            setUploading(false)
        }
    }

    function renderBlock(block: ProjectBlock, index: number) {
        switch (block.type) {
            case 'heading':
                return (
                    <InlineText
                        as="h2"
                        value={block.text}
                        editMode={editMode}
                        placeholder="Section heading"
                        ariaLabel="Heading"
                        className="block text-[20px] font-semibold font-heading"
                        onChange={text => update(index, {...block, text})}
                    />
                )
            case 'paragraph':
                return (
                    <InlineText
                        as="p"
                        value={block.text}
                        editMode={editMode}
                        multiline
                        rows={5}
                        placeholder="Explain how it works…"
                        ariaLabel="Paragraph"
                        className="block text-base leading-[1.7] whitespace-pre-wrap text-body"
                        onChange={text => update(index, {...block, text})}
                    />
                )
            case 'list':
                return (
                    <InlineStringList
                        items={block.items}
                        editMode={editMode}
                        variant="bullet"
                        addLabel="Add point"
                        placeholder="A point worth making"
                        onChange={items => update(index, {...block, items})}
                    />
                )
            case 'image':
                return (
                    <figure>
                        {block.url ? (
                            <div className="relative group/img">
                                <img
                                    src={block.url}
                                    alt={block.caption}
                                    className="w-full rounded-xl border"
                                    style={{borderColor: 'var(--color-divider)'}}
                                />
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={() => pickImage(block.id)}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-sm cursor-pointer"
                                    >
                                        Replace image
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => pickImage(block.id)}
                                className="w-full py-12 border border-dashed rounded-xl text-sm text-muted hover:border-accent-400 hover:text-accent-400 cursor-pointer transition-colors"
                                style={{borderColor: 'var(--color-divider)'}}
                            >
                                Choose an image
                            </button>
                        )}
                        {(block.caption || editMode) && (
                            <InlineText
                                as="figcaption"
                                value={block.caption}
                                editMode={editMode}
                                placeholder="Caption"
                                ariaLabel="Image caption"
                                className="block mt-2 text-sm text-muted text-center"
                                onChange={caption => update(index, {...block, caption})}
                            />
                        )}
                    </figure>
                )
            case 'code':
                return editMode ? (
                    <div className="rounded-xl p-4 overflow-x-auto" style={codePanelStyle}>
                        <InlineText
                            value={block.code}
                            editMode
                            multiline
                            rows={8}
                            placeholder="Paste a code snippet"
                            ariaLabel="Code"
                            className={codeClass}
                            onChange={code => update(index, {...block, code})}
                        />
                    </div>
                ) : (
                    <pre className="rounded-xl p-4 overflow-x-auto" style={codePanelStyle}>
                        <code className={codeClass}>{block.code}</code>
                    </pre>
                )
        }
    }

    const visible = editMode ? blocks : blocks.filter(isRenderable)

    return (
        <div className="space-y-6">
            <AnimatePresence initial={false}>
                {visible.map((block, index) => (
                    <motion.div
                        key={block.id}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.15}}
                        className={`group relative ${editMode ? 'pr-2' : ''}`}
                    >
                        {editMode && (
                            <EntryControls
                                index={index}
                                total={blocks.length}
                                label={block.type}
                                className="absolute -top-3 right-0 z-10 rounded-lg elev-sm px-1 bg-[var(--color-surface)] border border-[var(--color-divider)]"
                                onMove={to => onChange?.(moveItem(blocks, index, to))}
                                onRemove={() => remove(index)}
                            />
                        )}
                        {renderBlock(block, index)}
                    </motion.div>
                ))}
            </AnimatePresence>

            {editMode && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-dashed border-[var(--color-divider)]">
                    <span className="text-xs uppercase tracking-wider text-muted mr-1">Add</span>
                    {addOptions.map(({type, label, icon: Icon}) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => onChange?.([...blocks, makeBlock(type)])}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-body border border-[var(--color-divider)] rounded-lg hover:border-accent-400 hover:text-accent-400 cursor-pointer transition-colors"
                        >
                            <Icon size={14}/> {label}
                        </button>
                    ))}
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => pickImage(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-body border border-[var(--color-divider)] rounded-lg hover:border-accent-400 hover:text-accent-400 cursor-pointer transition-colors disabled:opacity-50"
                    >
                        <ImageIcon size={14}/> {uploading ? 'Uploading…' : 'Image'}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                            const file = e.target.files?.[0]
                            e.target.value = ''
                            if (file) void handleFile(file)
                        }}
                    />
                </div>
            )}
        </div>
    )
}

/** Blank blocks are scaffolding for the author; visitors shouldn't see them. */
function isRenderable(block: ProjectBlock): boolean {
    switch (block.type) {
        case 'heading':
        case 'paragraph': return block.text.trim().length > 0
        case 'list': return block.items.length > 0
        case 'image': return block.url.length > 0
        case 'code': return block.code.trim().length > 0
    }
}
