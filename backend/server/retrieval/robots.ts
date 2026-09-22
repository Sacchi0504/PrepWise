import axios from 'axios';
import robotsParser from 'robots-parser';

const parsedRobotsCache = new Map<string, any>();

export async function isUrlAllowed(url: string, userAgent = 'AIPrepKit/1.0'): Promise<boolean> {
  try {
    const parsedUrl = new URL(url);
    const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;

    if (!parsedRobotsCache.has(robotsUrl)) {
      try {
        const response = await axios.get(robotsUrl, { timeout: 3000 });
        const robots = robotsParser(robotsUrl, response.data);
        parsedRobotsCache.set(robotsUrl, robots);
      } catch (err) {
        // If robots.txt fails or 404s, we assume allowed
        parsedRobotsCache.set(robotsUrl, null);
      }
    }

    const robots = parsedRobotsCache.get(robotsUrl);
    if (!robots) return true;

    return robots.isAllowed(url, userAgent) !== false;
  } catch (error) {
    return false; // On parse error, default to block
  }
}
