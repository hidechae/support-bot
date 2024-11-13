import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import { Document } from '../../domain/models/document';
import { logger } from '../../utils/logger';
import type { CheerioAPI, Cheerio } from 'cheerio';

export class InstagramDocumentScraper extends BaseScraper {
  protected async scrapeSingleDocument(path: string): Promise<Document | null> {
    try {
      logger.info(`Scraping document: ${this.target.baseUrl}${path}`);

      const response = await this.client.get(path);
      const $ = cheerio.load(response.data);

      const mainContent = $('#documentation_body_pagelet');
      if (!mainContent.length) {
        logger.warn(`No main content found for path: ${path}`);
        return null;
      }

      const title = this.extractTitle($);
      const content = this.extractAndFormatContent($, mainContent);

      logger.info(`Successfully scraped document: ${title}`);

      return new Document(
        `${this.target.baseUrl}${path}`,
        content,
        {
          title,
          lastUpdated: new Date(),
          category: this.extractCategory(path)
        }
      );
    } catch (error) {
      logger.error(`Failed to scrape ${path}:`, error);
      throw error;
    }
  }

  /**
   * タイトルを抽出して整形する
   */
  private extractTitle($: CheerioAPI): string {
    const title = $('h1').first().text().trim();
    return title || 'Untitled Document';
  }

  /**
   * コンテンツを抽出して整形する
   */
  private extractAndFormatContent($: CheerioAPI, mainContent: Cheerio<any>): string {
    // 不要な要素を削除
    const contentClone = mainContent.clone();
    contentClone.find('script, style, nav, footer, .sidebar, .navigation').remove();

    // テキストの取得と整形
    let content = contentClone.text()
      .replace(/\s+/g, ' ')  // 連続する空白を1つに
      .replace(/\n\s*\n/g, '\n')  // 連続する改行を1つに
      .trim();

    // セクション間に適切な改行を追加
    content = this.formatSections($, content);

    return content;
  }

  /**
   * セクション構造を整形する
   */
  private formatSections($: CheerioAPI, content: string): string {
    const sections: string[] = [];

    $('#documentation_body_pagelet h1, #documentation_body_pagelet h2, #documentation_body_pagelet h3').each((_, elem) => {
      const section = $(elem);
      const sectionContent = section.nextUntil('h1, h2, h3').text().trim();
      if (sectionContent) {
        sections.push(`${section.text().trim()}\n${sectionContent}`);
      }
    });

    return sections.join('\n\n');
  }
}
