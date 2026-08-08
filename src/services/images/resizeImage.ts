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

/** The region of the source to keep, in source pixels after EXIF rotation. */
export interface CropRect {
    x: number
    y: number
    width: number
    height: number
}

export interface ResizeOptions {
    /** Keep the re-encoded render even when it is larger than the source file. */
    allowGrowth?: boolean
    /** Defaults to the whole image. */
    crop?: CropRect
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise(resolve => canvas.toBlob(resolve, type, quality))
}

function originalOf(file: File): ResizedImage {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    return { blob: file, ext }
}

/**
 * Trims a crop to the pixels that actually exist. Crops arrive as floats from a
 * layout measured in CSS pixels, so the edges can sit a fraction outside.
 */
function clampToBitmap(crop: CropRect, bitmap: ImageBitmap): CropRect {
    const x = Math.max(0, Math.min(crop.x, bitmap.width - 1))
    const y = Math.max(0, Math.min(crop.y, bitmap.height - 1))
    return {
        x,
        y,
        width: Math.max(1, Math.min(crop.width, bitmap.width - x)),
        height: Math.max(1, Math.min(crop.height, bitmap.height - y)),
    }
}

/** Draws `crop` into a canvas whose longest edge is at most `maxEdge`. Never upscales. */
function drawCropped(bitmap: ImageBitmap, crop: CropRect, maxEdge: number): HTMLCanvasElement | null {
    const scale = Math.min(1, maxEdge / Math.max(crop.width, crop.height))
    const width = Math.max(1, Math.round(crop.width * scale))
    const height = Math.max(1, Math.round(crop.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height)
    return canvas
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
    { allowGrowth = false, crop }: ResizeOptions = {}
): Promise<ResizedImage> {
    // A crop has to reach Storage, so the untouched original is only a last resort —
    // that includes the formats we would otherwise refuse to re-encode.
    const cropping = crop !== undefined
    if (!cropping && (!file.type.startsWith('image/') || PASS_THROUGH.has(file.type))) return originalOf(file)

    let bitmap: ImageBitmap
    try {
        // `from-image` applies EXIF rotation, so portrait photos don't come out sideways.
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
        return originalOf(file)
    }

    try {
        const region = crop
            ? clampToBitmap(crop, bitmap)
            : { x: 0, y: 0, width: bitmap.width, height: bitmap.height }

        const canvas = drawCropped(bitmap, region, maxEdge)
        if (!canvas) return originalOf(file)

        // Comparing a cropped render against the whole-image file size is meaningless,
        // and losing the crop is worse than spending the bytes.
        const keepLarger = allowGrowth || cropping

        const webp = await toBlob(canvas, 'image/webp', quality)
        if (webp && (keepLarger || webp.size < file.size)) return { blob: webp, ext: 'webp' }

        const jpeg = await toBlob(canvas, 'image/jpeg', quality)
        if (jpeg && (keepLarger || jpeg.size < file.size)) return { blob: jpeg, ext: 'jpg' }

        return originalOf(file)
    } finally {
        bitmap.close()
    }
}

/** The pair stored for each gallery photo: a display-sized image and a card/strip thumbnail. */
export async function resizeForGallery(file: File, crop?: CropRect): Promise<{ full: ResizedImage; thumb: ResizedImage }> {
    const [full, thumb] = await Promise.all([
        resizeImage(file, FULL_MAX_EDGE, FULL_QUALITY, { crop }),
        // Thumbnails are always worth generating, even for already-small sources.
        resizeImage(file, THUMB_MAX_EDGE, THUMB_QUALITY, { allowGrowth: true, crop }),
    ])
    return { full, thumb }
}
