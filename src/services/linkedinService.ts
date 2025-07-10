import puppeteer, { ElementHandle, Page } from 'puppeteer-core';
import { config } from '../config/environment';

export interface JobData {
  title: string;
  company: string;
  location: string;
  description: string;
  employmentType?: string;
  postedDate?: string;
  requirements: string[];
  skills: string[];
}

class LinkedInService {
  private readonly browserWSEndpoint: string;

  constructor() {
    // Convert https:// to wss:// for WebSocket connection
    const wsUrl = config.browserless.url.replace('https://', 'wss://');
    this.browserWSEndpoint = `${wsUrl}?token=${config.browserless.apiKey}`;
    console.log('Initializing LinkedIn service with endpoint:', this.browserWSEndpoint);
  }

  private async initializeBrowser() {
    try {
      console.log('Connecting to Browserless...');
      const browser = await puppeteer.connect({
        browserWSEndpoint: this.browserWSEndpoint,
        defaultViewport: { width: 1920, height: 1080 },
      });

      console.log('Creating new page...');
      const page = await browser.newPage();

      // Set anti-detection measures
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      });

      return { browser, page };
    } catch (error) {
      console.error('Browser initialization error:', error);
      throw new Error(`Failed to initialize browser: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractJobData(page: Page): Promise<JobData> {
    try {
      console.log('Waiting for job layout...');
      // Wait for critical elements
      await page.waitForSelector('.job-view-layout', { timeout: 30000 }); // Increased timeout

      console.log('Extracting job data...');
      const jobData: JobData = {
        title: await page.$eval('h1', (el: Element) => el.textContent?.trim() || ''),
        company: await page.$eval('.jobs-unified-top-card__company-name', (el: Element) => el.textContent?.trim() || ''),
        location: await page.$eval('.jobs-unified-top-card__bullet', (el: Element) => el.textContent?.trim() || ''),
        description: await page.$eval('.jobs-description-content__text', (el: Element) => el.textContent?.trim() || ''),
        requirements: [],
        skills: [],
      };

      // Extract employment type if available
      try {
        jobData.employmentType = await page.$eval('.jobs-unified-top-card__job-insight:first-child', (el: Element) => el.textContent?.trim() || '');
      } catch (error) {
        console.log('Employment type not found');
      }

      // Extract posted date if available
      try {
        jobData.postedDate = await page.$eval('.jobs-unified-top-card__posted-date', (el: Element) => el.textContent?.trim() || '');
      } catch (error) {
        console.log('Posted date not found');
      }

      // Extract requirements from description
      const descriptionText = jobData.description.toLowerCase();
      const requirementsSection = descriptionText.split('requirements:')[1]?.split('qualifications:')[0] || '';
      jobData.requirements = requirementsSection
        .split('\n')
        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
        .map(line => line.trim().replace(/^[•-]\s*/, ''));

      // Extract skills
      try {
        jobData.skills = await page.$$eval('.job-details-skill-match-status-list li', 
          (elements: Element[]) => elements.map((el: Element) => el.textContent?.trim() || ''));
      } catch (error) {
        console.log('Skills section not found');
      }

      console.log('Job data extracted successfully');
      return jobData;
    } catch (error) {
      console.error('Data extraction error:', error);
      throw new Error(`Failed to extract job data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async scrapeJobData(url: string): Promise<JobData> {
    let browser;
    let page;

    try {
      console.log('Starting job scraping for URL:', url);
      // Validate URL
      if (!url.includes('linkedin.com/jobs/view/')) {
        throw new Error('Invalid LinkedIn job URL');
      }

      const browserInstance = await this.initializeBrowser();
      browser = browserInstance.browser;
      page = browserInstance.page;

      // Add random delay to mimic human behavior
      await page.waitForTimeout(Math.random() * 2000 + 1000);

      console.log('Navigating to URL...');
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const jobData = await this.extractJobData(page);
      return jobData;
    } catch (error) {
      console.error('Job scraping error:', error);
      throw new Error(`Failed to scrape job data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (page) {
        console.log('Closing page...');
        await page.close();
      }
      if (browser) {
        console.log('Closing browser...');
        await browser.close();
      }
    }
  }
}

export const linkedInService = new LinkedInService(); 