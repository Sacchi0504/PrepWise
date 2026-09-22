import Groq from 'groq-sdk';

export const getLlmClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing');
  }
  return new Groq({ apiKey });
};

export async function generateStructuredData<T>(prompt: string, maxRetries = 3): Promise<T> {
  const groq = getLlmClient();
  
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs only valid JSON. Do not include markdown formatting or backticks around the JSON.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });
      
      const text = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(text) as T;
    } catch (error: any) {
      if (error?.status === 429) {
        retries++;
        console.warn(`Rate limit hit, retrying in ${Math.pow(2, retries)}s...`);
        await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
      } else if (error instanceof SyntaxError) {
        retries++;
        console.warn(`Invalid JSON returned, retrying...`);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed to generate valid structured data after max retries.');
}
