import type { ResumeData } from '../types/resume'
import Anthropic from '@anthropic-ai/sdk'

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

// ─────────────────────────────────────────────────────────────────────────────
// YOUR IMPLEMENTATION GOES HERE
// ─────────────────────────────────────────────────────────────────────────────
//
// This function receives the raw text extracted from the uploaded PDF and
// should return a structured ResumeData object using the Claude API.
//
// STEPS TO IMPLEMENT:
//
//   1. Install the Anthropic SDK:
//        npm install @anthropic-ai/sdk
//
//   2. Import the client:
//        import Anthropic from '@anthropic-ai/sdk'
//
//   3. Create a client instance:
//        const client = new Anthropic({ apiKey: '...', dangerouslyAllowBrowser: true })
//
//      ⚠️  For a real app, never expose your API key in frontend code.
//          Use an environment variable (import.meta.env.VITE_ANTHROPIC_API_KEY)
//          and ideally proxy requests through a backend server.
//
//   4. Call the Messages API:
//        const response = await client.messages.create({
//          model: 'claude-opus-4-6',
//          max_tokens: 4096,
//          system: SYSTEM_PROMPT,
//          messages: [{ role: 'user', content: buildUserMessage(rawText) }],
//        })
//
//   5. Extract the JSON string from the response:
//        const text = response.content[0].type === 'text' ? response.content[0].text : ''
//
//   6. Parse and return it:
//        return JSON.parse(text) as ResumeData
//
// ─────────────────────────────────────────────────────────────────────────────
export async function parseResumeWithAI(rawText: string): Promise<ResumeData> {
  console.log(rawText)
  const client = new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true })
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserMessage(rawText) }],
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  console.log(text)
  return JSON.parse(text) as ResumeData
}

// Export helpers so you can inspect them while building
export { SYSTEM_PROMPT, buildUserMessage }
