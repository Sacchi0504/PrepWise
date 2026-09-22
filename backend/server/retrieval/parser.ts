import * as cheerio from 'cheerio';

export interface ParsedPage {
  url: string;
  title: string;
  text: string;
  links: string[];
}

export function parseHtml(url: string, html: string): ParsedPage {
  const $ = cheerio.load(html);

  // Remove scripts, styles, noscript, etc.
  $('script, style, noscript, iframe, img, svg, video').remove();

  const title = $('title').text().trim();
  
  // Extract visible text
  let text = $('body').text();
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  const links: string[] = [];
  const baseUrl = new URL(url);

  $('a[href]').each((_, el) => {
    let href = $(el).attr('href');
    if (!href) return;
    
    // Normalize href to absolute URL
    try {
      if (href.startsWith('/')) {
        href = `${baseUrl.origin}${href}`;
      } else if (!href.startsWith('http')) {
        return; // Ignore mailto, tel, javascript, etc.
      }
      
      const parsedHref = new URL(href);
      // Only keep links to the same domain (internal links)
      if (parsedHref.hostname === baseUrl.hostname) {
        // Strip hash
        parsedHref.hash = '';
        const cleanUrl = parsedHref.toString();
        if (!links.includes(cleanUrl)) {
          links.push(cleanUrl);
        }
      }
    } catch (e) {
      // Ignore invalid URLs
    }
  });

  return {
    url,
    title,
    text,
    links
  };
}
