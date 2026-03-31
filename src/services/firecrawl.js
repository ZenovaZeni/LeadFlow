/**
 * Firecrawl Service
 * Handles web scraping and crawling logic.
 */

export class FirecrawlService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.firecrawl.dev/v1';
  }

  /**
   * Performs a deep crawl of the site.
   * @param {string} url - The starting URL
   * @param {object} options - Optional crawl settings
   */
  async crawl(url, options = {}) {
    if (!this.apiKey) {
      throw new Error('Firecrawl API Key is missing.');
    }

    try {
      console.log(`[Firecrawl] Starting deep crawl for: ${url}`);
      
      const response = await fetch(`${this.baseUrl}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          url,
          limit: options.limit || 10, // Default to 10 pages for "Deep Crawl"
          scrapeOptions: {
            formats: ['markdown'],
            ...options.scrapeOptions
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Firecrawl API Error: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('[Firecrawl] Crawl initialization failed:', err);
      throw err;
    }
  }

  /**
   * Scrapes a single page and extracts structured data.
   * @param {string} url - The URL to scrape
   */
  async scrape(url) {
    if (!this.apiKey) {
      throw new Error('Firecrawl API Key is missing.');
    }

    try {
      console.log(`[Firecrawl] Scraping single page: ${url}`);
      
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          url,
          formats: ['markdown']
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Firecrawl API Error: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('[Firecrawl] Scrape failed:', err);
      throw err;
    }
  }

  /**
   * Polls for crawl status until completion.
   * @param {string} jobId - The Firecrawl Job ID
   */
  async getCrawlStatus(jobId) {
    try {
      const response = await fetch(`${this.baseUrl}/crawl/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Firecrawl API Error: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`[Firecrawl] Failed to fetch job status for ${jobId}:`, err);
      throw err;
    }
  }
}

export const firecrawl = new FirecrawlService(import.meta.env.VITE_FIRECRAWL_API_KEY);
