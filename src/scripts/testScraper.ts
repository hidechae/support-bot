import { ScraperFactory, ScraperType } from '../infrastructure/scraper/factory';
import { config } from '../config';
import { logger } from '../utils/logger';

async function testScraper() {
  const instagramDocTarget = {
    baseUrl: config.sites.instagram.baseUrl,
    paths: config.sites.instagram.paths
  };

  try {
    const scraper = ScraperFactory.createScraper(
      ScraperType.INSTAGRAM_DOCUMENT,
      instagramDocTarget,
      {
        requestDelay: config.scraping.baseDelay,
        timeout: config.scraping.timeout
      }
    );

    logger.info('Scraping started...');
    const documents = await scraper.scrapeDocuments();

    logger.info(`\nScraped ${documents.length} documents:`);
    documents.forEach((doc, index) => {
      logger.info(`\n=== Document ${index + 1} ===`);
      logger.info('URL:', doc.url);
      logger.info('Title:', doc.metadata.title);
      logger.info('Category:', doc.metadata.category);
      logger.info('Content preview:');
      logger.info('---');
      logger.info(doc.content.substring(0, 200) + '...');
      logger.info('---');
      logger.info('Total content length:', doc.content.length);
    });
  } catch (error) {
    logger.error('Error during scraping:', error);
  }
}

testScraper();
