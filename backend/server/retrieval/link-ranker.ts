export function rankLinks(links: string[]): string[] {
  const scoreLink = (url: string): number => {
    let score = 0;
    const lowerUrl = url.toLowerCase();
    
    // Highly relevant pages for interview prep
    if (lowerUrl.includes('career') || lowerUrl.includes('job') || lowerUrl.includes('hiring')) {
      score += 50;
    }
    if (lowerUrl.includes('about') || lowerUrl.includes('company')) {
      score += 30;
    }
    if (lowerUrl.includes('interview') || lowerUrl.includes('process') || lowerUrl.includes('candidate')) {
      score += 40;
    }
    if (lowerUrl.includes('engineering') || lowerUrl.includes('tech') || lowerUrl.includes('blog')) {
      score += 20;
    }
    
    // Penalize irrelevant pages
    if (lowerUrl.includes('login') || lowerUrl.includes('signup') || lowerUrl.includes('privacy') || lowerUrl.includes('terms') || lowerUrl.includes('support')) {
      score -= 50;
    }
    
    // Penalize deep nesting
    const depth = url.split('/').length;
    score -= depth * 2;
    
    return score;
  };

  return links
    .map(link => ({ link, score: scoreLink(link) }))
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score >= 0) // only keep promising or neutral ones
    .map(item => item.link);
}
