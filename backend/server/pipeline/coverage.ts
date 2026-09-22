import { IRequirement, IQuestion } from '../models/Kit';

export function checkCoverage(requirements: IRequirement[], questions: IQuestion[]): string[] {
  const coveredIds = new Set<string>();

  for (const q of questions) {
    if (q.requirement_ids) {
      for (const reqId of q.requirement_ids) {
        coveredIds.add(reqId);
      }
    }
  }

  const uncovered: string[] = [];
  for (const req of requirements) {
    if (!coveredIds.has(req.id)) {
      uncovered.push(req.id);
    }
  }

  return uncovered;
}
