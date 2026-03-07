/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/https";
import {Anthropic} from "@anthropic-ai/sdk";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert resume parser.
Extract structured information from the provided resume text and return ONLY a valid JSON object.
Do not include any explanation, markdown, or code fences — just raw JSON. The response should start and end with curly braces.`


const JSON_SCHEMA = `{
  "name": "string",
  "title": "string (job title / professional headline)",
  "summary": "string (professional summary or objective)",
  "contact": {
    "email": "string | null",
    "phone": "string | null",
    "location": "string | null",
    "linkedin": "string | null",
    "github": "string | null",
    "website": "string | null"
  },
  "experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "string",
      "endDate": "string (use 'Present' if current)",
      "location": "string | null",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "field": "string",
      "graduationYear": "string",
      "gpa": "string | null"
    }
  ],
  "skills": [
    {
      "category": "string (e.g. 'Languages', 'Frameworks', 'Tools')",
      "items": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string | null"
    }
  ]
}`

function buildUserMessage(rawText: string): string {
    return `Parse this resume text into the JSON schema below.

SCHEMA:
${JSON_SCHEMA}

RESUME TEXT:
${rawText}`
}


const client = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY})

export const parseResume = onCall(async (request) => {
    const {rawText} = request.data

    if (!rawText) throw new HttpsError('invalid-argument', 'rawText is required')

    const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{role: 'user', content: buildUserMessage(rawText)}],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return JSON.parse(text)
})

// Export helpers so you can inspect them while building
export { SYSTEM_PROMPT, buildUserMessage }


