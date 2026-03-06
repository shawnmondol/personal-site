import type { ResumeData } from '../../types/Resume.ts'
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

export async function parseResumeWithAI(rawText: string): Promise<ResumeData> {
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
