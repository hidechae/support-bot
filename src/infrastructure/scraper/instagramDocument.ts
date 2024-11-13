// src/infrastructure/scraper/instagramDocument.ts
import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import { Document } from '../../domain/models/document';

/**
 * Instagram Platform のドキュメントスクレイパー
 * Meta Developers サイトのInstagram Platform ドキュメントをスクレイピング
 */
export class InstagramDocumentScraper extends BaseScraper {
  protected async scrapeSingleDocument(path: string): Promise<Document | null> {
    const response = await this.client.get(path);
    const $ = cheerio.load(response.data);

    // メインコンテンツの取得
    const mainContent = $('#documentation_body_pagelet');
    if (!mainContent.length) {
      console.warn(`No main content found for path: ${path}`);
      return null;
    }

    // タイトルの取得
    const title = mainContent.find('h1').first().text().trim();

    // 本文の取得（不要な要素を除外して整形）
    const clonedContent = mainContent.clone();
    // 不要な要素の削除
    clonedContent.find('script').remove();
    // その他、除外したい要素があれば追加

    const content = clonedContent.text().trim()
      .replace(/\s+/g, ' ')  // 連続する空白を1つに
      .replace(/\n+/g, '\n'); // 連続する改行を1つに

    if (!content) {
      console.warn(`No content found for path: ${path}`);
      return null;
    }

    // デバッグ用のログ出力
    console.log('Debug - Found elements:', {
      hasMainContent: mainContent.length > 0,
      title: title,
      contentLength: content.length
    });

    return new Document(
      `${this.target.baseUrl}${path}`,
      content,
      {
        title: title || 'Untitled Document',
        lastUpdated: new Date(),
        category: this.extractCategory(path)
      }
    );
  }
}
