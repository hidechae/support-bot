import { BaseScraper } from './base';
import { InstagramDocumentScraper } from './instagramDocument';
import { ScrapingTarget, ScraperConfig } from './types';

export enum ScraperType {
  INSTAGRAM_DOCUMENT = 'instagram_document'
}

/**
 * スクレイパーのファクトリークラス
 */
export class ScraperFactory {
  static createScraper(
    type: ScraperType,
    target: ScrapingTarget,
    config?: Partial<ScraperConfig>
  ): BaseScraper {
    switch (type) {
      case ScraperType.INSTAGRAM_DOCUMENT:
        return new InstagramDocumentScraper(target, config);
      default:
        throw new Error(`Unsupported scraper type: ${type}`);
    }
  }
}
