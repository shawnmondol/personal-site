/**
 * One-off backfill: re-encodes existing Storage images that were uploaded at full
 * camera resolution, and rewrites Firestore to point at the smaller derivatives.
 *
 *   Travel photos  → { url, thumb }   (2000px WebP + 400px WebP)
 *   Project images → downscaled WebP  (2000px, URL replaced in place)
 *
 * Runs server-side via firebase-admin, so there is no CORS involvement and the
 * originals never travel through a browser.
 *
 * Usage:
 *   node scripts/backfill-images.mjs                 # dry run — reports only
 *   node scripts/backfill-images.mjs --apply         # write derivatives + Firestore
 *   node scripts/backfill-images.mjs --apply --delete-originals
 *
 * Auth: set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON path, or pass
 *   --key ./service-account.json
 */

import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import sharp from 'sharp'

const FULL_MAX_EDGE = 2000
const FULL_QUALITY = 82
const THUMB_MAX_EDGE = 400
const THUMB_QUALITY = 75
const CACHE_CONTROL = 'public, max-age=31536000, immutable'

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Re-encodes existing Storage images and repoints Firestore at the derivatives.

  node scripts/backfill-images.mjs [options]

Options:
  --apply               Write derivatives and update Firestore (default: dry run)
  --delete-originals    With --apply, delete each source file after converting
  --key <path>          Service-account JSON path
  -h, --help            Show this message

Env:
  GOOGLE_APPLICATION_CREDENTIALS   Alternative to --key
  FIREBASE_STORAGE_BUCKET          Override the target bucket

Examples:
  npm run backfill:images                                   # preview
  npm run "backfill:images --apply"                         # convert
  npm run backfill:images -- --apply --delete-originals     # convert + clean up
`)
    process.exit(0)
}

const APPLY = args.includes('--apply')
const DELETE_ORIGINALS = args.includes('--delete-originals')
const keyPath = args[args.indexOf('--key') + 1]
const keyFile = args.includes('--key') ? keyPath : process.env.GOOGLE_APPLICATION_CREDENTIALS

if (!keyFile) {
    console.error('No credentials. Set GOOGLE_APPLICATION_CREDENTIALS or pass --key <path>.')
    console.error('Run with --help for usage.')
    process.exit(1)
}

if (!existsSync(keyFile)) {
    console.error(`Service-account file not found: ${keyFile}`)
    console.error('Download one from Firebase console → Project settings → Service accounts.')
    process.exit(1)
}

let serviceAccount
try {
    serviceAccount = JSON.parse(readFileSync(keyFile, 'utf8'))
} catch (error) {
    console.error(`Could not parse ${keyFile} as JSON: ${error.message}`)
    process.exit(1)
}
initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? `${serviceAccount.project_id}.firebasestorage.app`,
})

const db = getFirestore()
const bucket = getStorage().bucket()

const stats = { scanned: 0, converted: 0, skipped: 0, bytesBefore: 0, bytesAfter: 0, failed: 0 }

/** Pulls the object path out of a Firebase download URL. */
function storagePathFromUrl(url) {
    try {
        const { pathname } = new URL(url)
        const marker = '/o/'
        const at = pathname.indexOf(marker)
        if (at === -1) return null
        return decodeURIComponent(pathname.slice(at + marker.length))
    } catch {
        return null
    }
}

/** Mirrors getDownloadURL() by minting the same download token the web SDK uses. */
async function uploadDerivative(path, buffer) {
    const token = randomUUID()
    await bucket.file(path).save(buffer, {
        contentType: 'image/webp',
        metadata: {
            cacheControl: CACHE_CONTROL,
            metadata: { firebaseStorageDownloadTokens: token },
        },
    })
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`
}

async function convert(sourcePath, { withThumb }) {
    const file = bucket.file(sourcePath)
    const [exists] = await file.exists()
    if (!exists) {
        console.warn(`  ! missing in Storage: ${sourcePath}`)
        stats.failed++
        return null
    }

    const [original] = await file.download()
    stats.bytesBefore += original.length

    const stem = sourcePath.replace(/\.[^./]+$/, '')
    const fullBuffer = await sharp(original)
        .rotate()
        .resize({ width: FULL_MAX_EDGE, height: FULL_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: FULL_QUALITY })
        .toBuffer()

    const result = {}
    result.url = APPLY ? await uploadDerivative(`${stem}.webp`, fullBuffer) : `${stem}.webp`
    stats.bytesAfter += fullBuffer.length

    if (withThumb) {
        const thumbBuffer = await sharp(original)
            .rotate()
            .resize({ width: THUMB_MAX_EDGE, height: THUMB_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: THUMB_QUALITY })
            .toBuffer()
        result.thumb = APPLY ? await uploadDerivative(`${stem}-thumb.webp`, thumbBuffer) : `${stem}-thumb.webp`
        stats.bytesAfter += thumbBuffer.length
    }

    if (APPLY && DELETE_ORIGINALS && !sourcePath.endsWith('.webp')) {
        await file.delete().catch(() => {})
    }

    const saved = ((1 - fullBuffer.length / original.length) * 100).toFixed(0)
    console.log(`  ✓ ${sourcePath}  ${kb(original.length)} → ${kb(fullBuffer.length)} (−${saved}%)`)
    stats.converted++
    return result
}

function kb(bytes) {
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`
}

async function backfillTravel() {
    const ref = db.doc('about/profile')
    const snap = await ref.get()
    if (!snap.exists) {
        console.log('\nabout/profile: not found, skipping')
        return
    }

    const data = snap.data()
    let changed = false

    for (const tab of ['visited', 'wishlist']) {
        for (const location of data[tab] ?? []) {
            const images = location.images ?? []
            for (let i = 0; i < images.length; i++) {
                const entry = images[i]
                stats.scanned++

                // Already migrated — objects carry their own thumb.
                if (typeof entry !== 'string') { stats.skipped++; continue }

                const path = storagePathFromUrl(entry)
                if (!path) { console.warn(`  ! unparseable URL: ${entry}`); stats.failed++; continue }

                console.log(`\n${tab}/${location.id}[${i}]`)
                const converted = await convert(path, { withThumb: true })
                if (converted) { images[i] = converted; changed = true }
            }
        }
    }

    if (changed && APPLY) {
        await ref.set(data)
        console.log('\nabout/profile updated')
    }
}

async function backfillProjects() {
    const snap = await db.collection('projects').get()

    for (const doc of snap.docs) {
        const project = doc.data()
        let changed = false

        for (const block of project.body ?? []) {
            if (block.type !== 'image' || !block.url) continue
            stats.scanned++

            if (block.url.includes('.webp')) { stats.skipped++; continue }

            const path = storagePathFromUrl(block.url)
            if (!path) { console.warn(`  ! unparseable URL: ${block.url}`); stats.failed++; continue }

            console.log(`\nprojects/${doc.id} block ${block.id}`)
            const converted = await convert(path, { withThumb: false })
            if (converted) { block.url = converted.url; changed = true }
        }

        if (changed && APPLY) {
            await doc.ref.set(project)
            console.log(`projects/${doc.id} updated`)
        }
    }
}

console.log(APPLY ? 'Backfilling images (writing changes)…' : 'DRY RUN — no changes will be written. Re-run with --apply.')
console.log(`Bucket: ${bucket.name}\n`)

await backfillTravel()
await backfillProjects()

console.log('\n─────────────────────────────')
console.log(`scanned    ${stats.scanned}`)
console.log(`converted  ${stats.converted}`)
console.log(`skipped    ${stats.skipped}`)
console.log(`failed     ${stats.failed}`)
if (stats.bytesBefore) {
    const saved = ((1 - stats.bytesAfter / stats.bytesBefore) * 100).toFixed(1)
    console.log(`size       ${kb(stats.bytesBefore)} → ${kb(stats.bytesAfter)}  (−${saved}%)`)
}
if (!APPLY) console.log('\nDry run only. Re-run with --apply to write.')
