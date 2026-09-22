import { z } from 'zod';
import { IKit } from '../models/Kit';

export const KitOutputSchema = z.object({
  source: z.object({
    company: z.string(),
    company_url: z.string(),
    role: z.string(),
    location: z.string(),
    jd_chars: z.number(),
    researched_at: z.string(),
    pages_used: z.array(z.string())
  }),
  company_brief: z.object({
    summary: z.string(),
    what_they_do: z.string(),
    sources: z.array(z.string())
  }),
  role: z.object({
    title: z.string(),
    seniority: z.string(),
    responsibilities: z.array(z.string()),
    requirements: z.array(z.object({
      id: z.string(),
      text: z.string(),
      kind: z.enum(['technical', 'behavioural', 'domain']),
      priority: z.enum(['must', 'nice'])
    }))
  }),
  questions: z.array(z.object({
    id: z.string(),
    requirement_ids: z.array(z.string()),
    category: z.enum(['technical', 'behavioural', 'system-design', 'company-fit']),
    prompt: z.string(),
    answer_outline: z.string(),
    difficulty: z.number()
  })),
  flashcards: z.array(z.object({
    id: z.string(),
    front: z.string(),
    back: z.string(),
    requirement_ids: z.array(z.string())
  })),
  schedule: z.object({
    days_available: z.number(),
    days: z.array(z.object({
      day: z.number(),
      focus: z.string(),
      question_ids: z.array(z.string()),
      minutes: z.number()
    }))
  }),
  coverage: z.object({
    uncovered_requirement_ids: z.array(z.string()),
    passes: z.number()
  })
});

export function validateKitOutput(kitData: any): void {
  // Throws if invalid
  KitOutputSchema.parse(kitData);
}

// Function to format the DB model into the exact Appendix A structure
export function formatKitOutput(kit: IKit) {
  return {
    source: {
      company: kit.source.company || '',
      company_url: kit.source.company_url || '',
      role: kit.source.role || '',
      location: kit.source.location || '',
      jd_chars: kit.source.jd_chars || 0,
      researched_at: kit.source.researched_at || new Date().toISOString(),
      pages_used: kit.source.pages_used || []
    },
    company_brief: {
      summary: kit.company_brief.summary || '',
      what_they_do: kit.company_brief.what_they_do || '',
      sources: kit.company_brief.sources || []
    },
    role: {
      title: kit.role.title || '',
      seniority: kit.role.seniority || '',
      responsibilities: kit.role.responsibilities || [],
      requirements: kit.role.requirements.map(r => ({
        id: r.id,
        text: r.text,
        kind: r.kind,
        priority: r.priority
      }))
    },
    questions: kit.questions.map(q => ({
      id: q.id,
      requirement_ids: q.requirement_ids || [],
      category: q.category,
      prompt: q.prompt,
      answer_outline: q.answer_outline,
      difficulty: q.difficulty
    })),
    flashcards: kit.flashcards.map(f => ({
      id: f.id,
      front: f.front,
      back: f.back,
      requirement_ids: f.requirement_ids || []
    })),
    schedule: {
      days_available: kit.schedule.days_available,
      days: kit.schedule.days.map(d => ({
        day: d.day,
        focus: d.focus,
        question_ids: d.question_ids || [],
        minutes: d.minutes
      }))
    },
    coverage: {
      uncovered_requirement_ids: kit.coverage.uncovered_requirement_ids || [],
      passes: kit.coverage.passes || 0
    }
  };
}
