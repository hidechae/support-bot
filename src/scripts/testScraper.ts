import { DocumentScraper } from '../infrastructure/scraper';

async function testScraper() {
  // テスト用のURLを指定
  const urls = [
    'https://example.com/page1',  // ここは実際にスクレイピングしたいURLに変更してください
  ];

  try {
    const scraper = new DocumentScraper('https://example.com');
    console.log('Scraping started...');

    const documents = await scraper.scrapeDocuments(urls);

    console.log('\nScraped documents:');
    documents.forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`);
      console.log('URL:', doc.url);
      console.log('Title:', doc.metadata.title);
      console.log('Category:', doc.metadata.category);
      console.log('Content preview:', doc.content.substring(0, 200) + '...');
    });
  } catch (error) {
    console.error('Error during scraping:', error);
  }
}

// スクリプトの実行
testScraper();
