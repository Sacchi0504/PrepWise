import { generateStructuredData } from '../llm/client';
import { IRequirement } from '../models/Kit';

interface ExtractionResult {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: IRequirement[];
}

export async function extractJd(jdText: string): Promise<ExtractionResult> {
  const prompt = `
Extract structured information from the following Job Description.
Pay close attention to requirement priorities: treat "required" and "must have" as "must", and "bonus", "nice to have", "plus" as "nice".

Output the result STRICTLY as a JSON object with the following schema:
{
  "title": "string",
  "seniority": "string",
  "responsibilities": ["string"],
  "requirements": [
    {
      "text": "string",
      "kind": "technical" | "behavioural" | "domain",
      "priority": "must" | "nice"
    }
  ]
}

Job Description:
${jdText}
  `;

  const data = await generateStructuredData<Omit<ExtractionResult, 'requirements'> & { requirements: Omit<IRequirement, 'id'>[] }>(prompt);
  
  // Assign stable IDs
  const requirementsWithIds = data.requirements.map((req, i) => ({
    ...req,
    id: `r${i + 1}`
  })) as IRequirement[];

  return {
    ...data,
    requirements: requirementsWithIds
  };
}
