export function updateAt<T>(items: T[], index: number, value: T): T[] {
    return items.map((item, i) => i === index ? value : item)
}

export function removeAt<T>(items: T[], index: number): T[] {
    return items.filter((_, i) => i !== index)
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
    if (to < 0 || to >= items.length) return items
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
}
