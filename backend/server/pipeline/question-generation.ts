import { generateStructuredData } from '../llm/client';
import { IRequirement, IQuestion, IFlashcard } from '../models/Kit';

export async function generateQuestions(
  requirements: IRequirement[],
  roleTitle: string,
  seniority: string,
  companyBrief: string,
  publicProcessContext: string
): Promise<{ questions: IQuestion[], flashcards: IFlashcard[] }> {
  
  if (requirements.length === 0) return { questions: [], flashcards: [] };

  const reqString = requirements.map(r => `[${r.id}] (${r.kind}, ${r.priority}): ${r.text}`).join('\n');

  const prompt = `
You are an expert technical interviewer creating a preparation kit for a ${seniority} ${roleTitle} role.

Company Context:
${companyBrief}

Public Interview Process context:
${publicProcessContext}

Here are the extracted job requirements:
${reqString}

Generate a set of interview questions and flashcards.
CRITICAL RULES:
1. Every generated question MUST map to one or more requirement IDs from the list above.
2. The generated questions must thoroughly cover the 'must' requirements.
3. Include a mix of technical, behavioural, system-design (if applicable), and company-fit questions.
4. Difficulty should be 1 (Easy), 2 (Medium), or 3 (Hard).
5. Generate flashcards for quick factual recall based on the requirements.

Output the result STRICTLY as a JSON object with the following schema:
{
  "questions": [
    {
      "requirement_ids": ["string"],
      "category": "technical" | "behavioural" | "system-design" | "company-fit",
      "prompt": "string",
      "answer_outline": "string",
      "difficulty": number // 1, 2, or 3
    }
  ],
  "flashcards": [
    {
      "front": "string",
      "back": "string",
      "requirement_ids": ["string"]
    }
  ]
}
  `;

  const data = await generateStructuredData<{ 
    questions: Omit<IQuestion, 'id'>[], 
    flashcards: Omit<IFlashcard, 'id'>[] 
  }>(prompt);

  const questionsWithIds = data.questions.map((q, i) => ({
    ...q,
    id: `q${Date.now()}_${i}`,
    source: 'generated' as const
  })) as IQuestion[];

  const flashcardsWithIds = data.flashcards.map((f, i) => ({
    ...f,
    id: `f${Date.now()}_${i}`,
    source: 'generated' as const
  })) as IFlashcard[];

  return { questions: questionsWithIds, flashcards: flashcardsWithIds };
}
