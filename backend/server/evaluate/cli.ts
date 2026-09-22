import fs from 'fs/promises';
import path from 'path';
import minimist from 'minimist';
import { connectDB } from '../db';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { extractJd } from '../pipeline/extraction';
import { researchCompany } from '../pipeline/research';
import { generateQuestions } from '../pipeline/question-generation';
import { checkCoverage } from '../pipeline/coverage';
import { createSchedule } from '../pipeline/scheduling';
import { validateKitOutput, formatKitOutput } from '../pipeline/validation';
import { IKit, Kit } from '../models/Kit';

interface Case {
  id: string;
  jd: string;
  company_url: string;
  days: number;
}

async function processCase(testCase: Case): Promise<any> {
  // Temporary kit object just to hold state during processing
  const mockKit: Partial<IKit> = {
    source: {
      company: '',
      company_url: testCase.company_url,
      role: testCase.jd.substring(0, 50),
      location: '',
      jd_chars: testCase.jd.length,
      researched_at: '',
      pages_used: []
    },
    company_brief: { summary: '', what_they_do: '', sources: [] },
    role: { title: '', seniority: '', responsibilities: [], requirements: [] },
    questions: [],
    flashcards: [],
    schedule: { days_available: testCase.days, days: [] },
    coverage: { uncovered_requirement_ids: [], passes: 0 }
  };

  const researchResult = await researchCompany(testCase.company_url);
  mockKit.company_brief = researchResult.brief;
  mockKit.source!.pages_used = researchResult.pagesUsed;
  mockKit.source!.researched_at = new Date().toISOString();

  const jdExtracted = await extractJd(testCase.jd);
  mockKit.role = {
    title: jdExtracted.title,
    seniority: jdExtracted.seniority,
    responsibilities: jdExtracted.responsibilities,
    requirements: jdExtracted.requirements
  };
  mockKit.source!.role = jdExtracted.title;

  let { questions, flashcards } = await generateQuestions(
    mockKit.role.requirements,
    mockKit.role.title,
    mockKit.role.seniority,
    mockKit.company_brief!.summary,
    researchResult.publicProcessContext
  );

  let uncovered = checkCoverage(mockKit.role.requirements, questions);
  let passes = 1;

  if (uncovered.length > 0) {
    passes = 2;
    const uncoveredReqs = mockKit.role.requirements.filter(r => uncovered.includes(r.id));
    const { questions: q2, flashcards: f2 } = await generateQuestions(
      uncoveredReqs,
      mockKit.role.title,
      mockKit.role.seniority,
      mockKit.company_brief!.summary,
      researchResult.publicProcessContext
    );
    
    questions = [...questions, ...q2];
    flashcards = [...flashcards, ...f2];
    uncovered = checkCoverage(mockKit.role.requirements, questions);
  }

  mockKit.questions = questions as any;
  mockKit.flashcards = flashcards as any;
  mockKit.coverage = {
    uncovered_requirement_ids: uncovered,
    passes
  };

  mockKit.schedule = createSchedule(testCase.days, mockKit.role.requirements, questions);

  const finalOutput = formatKitOutput(mockKit as IKit);
  validateKitOutput(finalOutput);

  return finalOutput;
}

async function main() {
  const argv = minimist(process.argv.slice(2));
  const inputFile = argv.input;
  const outputFile = argv.output;

  if (!inputFile || !outputFile) {
    console.error('Usage: npm run evaluate -- --input cases.json --output kits.json');
    process.exit(1);
  }

  try {
    const inputPath = path.resolve(process.cwd(), inputFile);
    const outputPath = path.resolve(process.cwd(), outputFile);

    const casesData = await fs.readFile(inputPath, 'utf-8');
    const cases: Case[] = JSON.parse(casesData);

    const results = [];

    for (const testCase of cases) {
      console.log(`Processing case ${testCase.id}...`);
      try {
        const kitData = await processCase(testCase);
        results.push({
          id: testCase.id,
          status: 'ok',
          kit: kitData,
          error: null
        });
        console.log(`Case ${testCase.id} succeeded.`);
      } catch (err: any) {
        console.error(`Case ${testCase.id} failed:`, err.message);
        results.push({
          id: testCase.id,
          status: 'failed',
          kit: null,
          error: {
            code: 'GENERATION_ERROR',
            message: err.message
          }
        });
      }
    }

    const finalReport = {
      version: '1.0',
      generated_at: new Date().toISOString(),
      kits: results
    };

    await fs.writeFile(outputPath, JSON.stringify(finalReport, null, 2));
    console.log(`Evaluation complete. Results written to ${outputFile}`);
    process.exit(0);

  } catch (error) {
    console.error('Fatal evaluation error:', error);
    process.exit(1);
  }
}

main();
