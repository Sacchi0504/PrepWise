import { generateStructuredData } from '../llm/client';
import { IRequirement } from '../models/Kit';

export interface ResumeEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export async function evaluateResume(
  resumeText: string,
  requirements: IRequirement[],
  roleTitle: string
): Promise<ResumeEvaluation> {
  const reqString = requirements
    .map(r => `[${r.priority.toUpperCase()}] ${r.text}`)
    .join('\n');

  const prompt = `
You are an expert technical recruiter and hiring manager. 
You are evaluating a candidate's resume for the role of "${roleTitle}".

Here are the extracted job requirements:
${reqString}

Here is the candidate's resume:
---
${resumeText.substring(0, 15000)} // Ensure we don't blow up the context window
---

Evaluate the candidate's compatibility with the job requirements.
Output a STRICT JSON object with the following schema:
{
  "score": number, // A score from 0 to 100 representing overall fit
  "strengths": ["string"], // 3-5 specific requirements the candidate meets well
  "weaknesses": ["string"], // 3-5 specific requirements the candidate lacks or is weak in
  "summary": "string" // A 2-3 sentence summary of their fit
}
  `;

  return await generateStructuredData<ResumeEvaluation>(prompt);
}
