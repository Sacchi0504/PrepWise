import { generateStructuredData } from '../llm/client';
import { fetchHtml } from '../retrieval/fetcher';
import { parseHtml } from '../retrieval/parser';
import { rankLinks } from '../retrieval/link-ranker';

export interface CompanyBrief {
  summary: string;
  what_they_do: string;
  sources: string[];
}

export interface ResearchResult {
  brief: CompanyBrief;
  publicProcessContext: string;
  pagesUsed: string[];
}

export async function researchCompany(companyUrl: string): Promise<ResearchResult> {
  const pagesUsed: string[] = [];
  let allTextContext = '';
  
  try {
    const homeHtml = await fetchHtml(companyUrl);
    if (!homeHtml) throw new Error('Company homepage unreachable');
    
    const homeParsed = parseHtml(companyUrl, homeHtml);
    pagesUsed.push(companyUrl);
    allTextContext += `--- Source: ${companyUrl} ---\n${homeParsed.text}\n\n`;
    
    const rankedLinks = rankLinks(homeParsed.links);
    const pagesToCrawl = rankedLinks.slice(0, 2);
    
    for (const link of pagesToCrawl) {
      try {
        const html = await fetchHtml(link);
        if (html) {
          const parsed = parseHtml(link, html);
          pagesUsed.push(link);
          allTextContext += `--- Source: ${link} ---\n${parsed.text}\n\n`;
        }
      } catch (err) {
        console.warn(`Skipping link ${link} due to error`);
      }
    }

    const prompt = `
Extract company information and any available public interview process details from the following website text.
If no public interview information is found, explicitly output "No reliable public interview-process information was found." for the public_interview_process field.

Output the result STRICTLY as a JSON object with the following schema:
{
  "summary": "string",
  "what_they_do": "string",
  "public_interview_process": "string"
}

Website Content:
${allTextContext.substring(0, 15000)} // truncate to prevent token explosion
    `;

    const data = await generateStructuredData<{summary: string, what_they_do: string, public_interview_process: string}>(prompt);
    
    let processContext = data.public_interview_process;
    if (!processContext || processContext.trim() === '' || processContext.toLowerCase().includes('not found')) {
      processContext = 'No reliable public interview-process information was found.';
    }

    return {
      brief: {
        summary: data.summary,
        what_they_do: data.what_they_do,
        sources: pagesUsed
      },
      publicProcessContext: processContext,
      pagesUsed
    };

  } catch (error) {
    console.error('Research failed', error);
    return {
      brief: {
        summary: 'Company information could not be retrieved.',
        what_they_do: 'Unknown',
        sources: []
      },
      publicProcessContext: 'No reliable public interview-process information was found.',
      pagesUsed: []
    };
  }
}
