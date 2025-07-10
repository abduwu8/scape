import puppeteer, { Page, Browser } from 'puppeteer-core';
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
  private async initializeBrowser(): Promise<{ browser: Browser; page: Page }> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows Chrome path
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
      });

      const page = await browser.newPage();

      // Set anti-detection measures
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      });

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      return { browser, page };
    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractJobData(page: Page): Promise<JobData> {
    try {
      // Wait for critical elements
      await page.waitForSelector('.job-view-layout', { timeout: 10000 });

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
      } catch {
        // Employment type is optional
      }

      // Extract posted date if available
      try {
        jobData.postedDate = await page.$eval('.jobs-unified-top-card__posted-date', (el: Element) => el.textContent?.trim() || '');
      } catch {
        // Posted date is optional
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
      } catch {
        // Skills section is optional
      }

      return jobData;
    } catch (error) {
      throw new Error(`Failed to extract job data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async scrapeJobData(url: string): Promise<JobData> {
    let browser;
    let page;

    try {
      // Validate URL
      if (!url.includes('linkedin.com/jobs/view/')) {
        throw new Error('Invalid LinkedIn job URL');
      }

      const browserInstance = await this.initializeBrowser();
      browser = browserInstance.browser;
      page = browserInstance.page;

      // Add random delay to mimic human behavior
      await page.waitForTimeout(Math.random() * 2000 + 1000);

      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const jobData = await this.extractJobData(page);
      return jobData;
    } catch (error) {
      throw new Error(`Failed to scrape job data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (page) await page.close();
      if (browser) await browser.close();
    }
  }
}

export const linkedInService = new LinkedInService(); 