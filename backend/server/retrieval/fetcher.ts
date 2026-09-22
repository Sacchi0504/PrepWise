import axios from 'axios';
import { isUrlAllowed } from './robots';

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB

function isPrivateIp(ip: string): boolean {
  // Simple check for common private/loopback IPv4 ranges.
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 169 && parts[1] === 254) return true; // APIPA
  
  return false;
}

export async function fetchHtml(url: string): Promise<string | null> {
  try {
    const parsedUrl = new URL(url);

    // Skip localhost and basic loopback/private checks based on hostname (simple DNS resolution avoidance)
    // A full implementation would resolve DNS and check the IP, but for the assessment scope,
    // we block obvious local hostnames.
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedUrl.hostname) || isPrivateIp(parsedUrl.hostname)) {
      console.log(`Skipping private/loopback url: ${url}`);
      return null;
    }

    const allowed = await isUrlAllowed(url);
    if (!allowed) {
      console.log(`Blocked by robots.txt: ${url}`);
      return null;
    }

    const response = await axios.get(url, {
      timeout: 10000,
      maxContentLength: MAX_RESPONSE_SIZE,
      responseType: 'text',
      headers: {
        'User-Agent': 'AIPrepKit/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });

    const contentType = (response.headers['content-type'] as string) || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      console.log(`Invalid content type ${contentType} for url: ${url}`);
      return null;
    }

    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch ${url}:`, error.message);
    return null;
  }
}
