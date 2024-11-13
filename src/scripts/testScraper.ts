// src/scripts/testScraper.ts
import { ScraperFactory, ScraperType } from '../infrastructure/scraper/factory';
import * as dotenv from 'dotenv';

dotenv.config();

async function testScraper() {
  const instagramDocTarget = {
    baseUrl: 'https://developers.facebook.com',
    paths: [
      '/docs/instagram-api/guides/content-publishing',
      '/docs/instagram-api/reference/ig-user',
      '/docs/instagram-basic-display-api',  // Basic Display APIのトップページ
      '/docs/instagram-basic-display-api/getting-started',  // Getting Startedガイド
    ]
  };

  try {
    const scraper = ScraperFactory.createScraper(
      ScraperType.INSTAGRAM_DOCUMENT,
      instagramDocTarget
    );

    console.log('Scraping started...');

    // 各ページの処理状況を表示
    console.log('\nProcessing pages:');
    const documents = await scraper.scrapeDocuments();

    // 結果の表示
    console.log(`\nSuccessfully scraped ${documents.length} documents:`);
    documents.forEach((doc, index) => {
      console.log(`\n=== Document ${index + 1} ===`);
      console.log('URL:', doc.url);
      console.log('Title:', doc.metadata.title);
      console.log('Category:', doc.metadata.category);
      console.log(`Content length: ${doc.content.length} characters`);
      console.log('\nFirst 200 characters of content:');
      console.log('---');
      console.log(doc.content.substring(0, 200));
      console.log('---');
    });

  } catch (error) {
    console.error('Error during scraping:', error);
  }
}

// スクリプトの実行
testScraper();
