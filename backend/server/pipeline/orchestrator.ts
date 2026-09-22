import crypto from 'crypto';
import { Kit, IKit } from '../models/Kit';
import { extractJd } from './extraction';
import { researchCompany } from './research';
import { generateQuestions } from './question-generation';
import { checkCoverage } from './coverage';
import { createSchedule } from './scheduling';

export async function runGenerationPipeline(kitId: string) {
  const kit = await Kit.findById(kitId);
  if (!kit) throw new Error('Kit not found');

  try {
    // 1. Research Company
    kit.generationState = 'researching';
    await kit.save();

    const researchResult = await researchCompany(kit.source.company_url);
    kit.company_brief = researchResult.brief;
    kit.source.pages_used = researchResult.pagesUsed;
    kit.source.researched_at = new Date().toISOString();
    await kit.save();

    // 2. Extract JD
    kit.generationState = 'generating';
    await kit.save();

    const jdExtracted = await extractJd(kit.source.role); // Using 'role' field as JD input originally
    kit.role = {
      title: jdExtracted.title,
      seniority: jdExtracted.seniority,
      responsibilities: jdExtracted.responsibilities,
      requirements: jdExtracted.requirements
    };
    kit.source.role = jdExtracted.title;
    await kit.save();

    // 3. First Pass Question Generation
    let { questions, flashcards } = await generateQuestions(
      kit.role.requirements,
      kit.role.title,
      kit.role.seniority,
      kit.company_brief.summary,
      researchResult.publicProcessContext
    );

    // 4. Coverage validation and optional second pass
    kit.generationState = 'validating';
    await kit.save();

    let uncovered = checkCoverage(kit.role.requirements, questions);
    let passes = 1;

    if (uncovered.length > 0) {
      passes = 2;
      const uncoveredReqs = kit.role.requirements.filter(r => uncovered.includes(r.id));
      const { questions: q2, flashcards: f2 } = await generateQuestions(
        uncoveredReqs,
        kit.role.title,
        kit.role.seniority,
        kit.company_brief.summary,
        researchResult.publicProcessContext
      );
      
      questions = [...questions, ...q2];
      flashcards = [...flashcards, ...f2];
      uncovered = checkCoverage(kit.role.requirements, questions); // check again
    }

    kit.questions = questions;
    kit.flashcards = flashcards;
    kit.coverage = {
      uncovered_requirement_ids: uncovered,
      passes
    };
    await kit.save();

    // 5. Schedule
    kit.schedule = createSchedule(kit.schedule.days_available, kit.role.requirements, questions);
    
    // 6. Complete
    kit.generationState = 'completed';
    kit.status = 'ok';
    await kit.save();

  } catch (error: any) {
    console.error('Pipeline failed:', error);
    kit.generationState = 'failed';
    kit.status = 'failed';
    kit.error = error.message;
    await kit.save();
  }
}

export function generateContentHash(jd: string, url: string): string {
  return crypto.createHash('sha256').update(`${jd}|${url}`).digest('hex');
}
