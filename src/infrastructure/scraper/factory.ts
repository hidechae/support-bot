import { BaseScraper } from './base';
import { InstagramDocumentScraper } from './instagramDocument';
import { ScrapingTarget } from './types';

export enum ScraperType {
  INSTAGRAM_DOCUMENT = 'instagram_document',
  // 将来的に他のスクレイパーを追加可能
}

/**
 * スクレイパーのファクトリークラス
 */
export class ScraperFactory {
  static createScraper(type: ScraperType, target: ScrapingTarget): BaseScraper {
    switch (type) {
      case ScraperType.INSTAGRAM_DOCUMENT:
        return new InstagramDocumentScraper(target, {
          requestDelay: 2000,
          maxRetries: 3
        });
      default:
        throw new Error(`Unsupported scraper type: ${type}`);
    }
  }
}
