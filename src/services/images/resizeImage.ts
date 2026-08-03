/**
 * Client-side image downscaling. Phone photos land at ~4000×3000 / 5–10 MB, which
 * is 20–40× larger than anything the UI actually renders, so every upload is
 * re-encoded to WebP at a sane edge length before it reaches Storage.
 */

/** Formats that must not be re-encoded — canvas would drop animation or rasterise vectors. */
const PASS_THROUGH = new Set(['image/gif', 'image/svg+xml'])

export const FULL_MAX_EDGE = 2000
export const FULL_QUALITY = 0.82
export const THUMB_MAX_EDGE = 400
export const THUMB_QUALITY = 0.75

export interface ResizedImage {
    blob: Blob
    /** File extension to store under, so the Storage path matches the encoded type. */
    ext: string
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise(resolve => canvas.toBlob(resolve, type, quality))
}

function originalOf(file: File): ResizedImage {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    return { blob: file, ext }
}

/**
 * Downscales so the longest edge is at most `maxEdge`, preserving aspect ratio.
 * Never upscales, and falls back to the original whenever re-encoding would not
 * actually save bytes.
 */
export async function resizeImage(
    file: File,
    maxEdge: number,
    quality: number,
    { allowGrowth = false } = {}
): Promise<ResizedImage> {
    if (!file.type.startsWith('image/') || PASS_THROUGH.has(file.type)) return originalOf(file)

    let bitmap: ImageBitmap
    try {
        // `from-image` applies EXIF rotation, so portrait photos don't come out sideways.
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
        return originalOf(file)
    }

    try {
        const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
        const width = Math.max(1, Math.round(bitmap.width * scale))
        const height = Math.max(1, Math.round(bitmap.height * scale))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return originalOf(file)
        ctx.drawImage(bitmap, 0, 0, width, height)

        const webp = await toBlob(canvas, 'image/webp', quality)
        if (webp && (allowGrowth || webp.size < file.size)) return { blob: webp, ext: 'webp' }

        const jpeg = await toBlob(canvas, 'image/jpeg', quality)
        if (jpeg && (allowGrowth || jpeg.size < file.size)) return { blob: jpeg, ext: 'jpg' }

        return originalOf(file)
    } finally {
        bitmap.close()
    }
}

/** The pair stored for each gallery photo: a display-sized image and a card/strip thumbnail. */
export async function resizeForGallery(file: File): Promise<{ full: ResizedImage; thumb: ResizedImage }> {
    const [full, thumb] = await Promise.all([
        resizeImage(file, FULL_MAX_EDGE, FULL_QUALITY),
        // Thumbnails are always worth generating, even for already-small sources.
        resizeImage(file, THUMB_MAX_EDGE, THUMB_QUALITY, { allowGrowth: true }),
    ])
    return { full, thumb }
}
