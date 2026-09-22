import { IRequirement, IQuestion, IKit } from '../models/Kit';

export function createSchedule(daysAvailable: number, requirements: IRequirement[], questions: IQuestion[]): IKit['schedule'] {
  const scheduleDays: IKit['schedule']['days'] = [];
  
  // Sort questions by priority of their requirements and difficulty
  const reqPriorityMap = new Map(requirements.map(r => [r.id, r.priority]));
  
  const sortedQuestions = [...questions].sort((a, b) => {
    // 1. Check if one has 'must' and other doesn't
    const aHasMust = (a.requirement_ids || []).some(id => reqPriorityMap.get(id) === 'must');
    const bHasMust = (b.requirement_ids || []).some(id => reqPriorityMap.get(id) === 'must');
    
    if (aHasMust && !bHasMust) return -1;
    if (!aHasMust && bHasMust) return 1;
    
    // 2. Sort by difficulty (harder first)
    return b.difficulty - a.difficulty;
  });

  // Basic allocation
  const questionsPerDay = Math.ceil(sortedQuestions.length / daysAvailable);
  let qIndex = 0;

  for (let i = 1; i <= daysAvailable; i++) {
    const dayQuestions = sortedQuestions.slice(qIndex, qIndex + questionsPerDay);
    qIndex += questionsPerDay;

    let focus = `General Preparation Day ${i}`;
    if (dayQuestions.length > 0) {
      // Determine focus based on the most common category
      const categoryCounts = dayQuestions.reduce((acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      let dominantCategory = dayQuestions[0].category;
      let maxCount = 0;
      for (const [cat, count] of Object.entries(categoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantCategory = cat as IQuestion['category'];
        }
      }
      
      focus = `Focus on ${dominantCategory.replace('-', ' ')} topics`;
    } else {
      // If we ran out of questions, still create a day
      focus = 'Review and Mock Interview Practice';
    }

    scheduleDays.push({
      day: i,
      focus: focus,
      question_ids: dayQuestions.map(q => q.id),
      minutes: dayQuestions.length > 0 ? dayQuestions.length * 20 : 60 // Roughly 20 mins per question
    });
  }

  return {
    days_available: daysAvailable,
    days: scheduleDays
  };
}
