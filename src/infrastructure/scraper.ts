import axios from 'axios';
import * as cheerio from 'cheerio';
import { Document, DocumentMetadata } from '../domain/models/document';
import { setTimeout } from 'timers/promises';

/**
 * Webページをスクレイピングするためのインフラストラクチャサービス
 */
export class DocumentScraper {
  constructor(
    /**
     * スクレイピング対象のベースURL
     * 例: https://example.com/docs
     */
    private readonly baseUrl: string,
    /**
     * スクレイピング時のディレイ (ms)
     * デフォルト: 1000ms
     */
    private readonly requestDelay: number = 1000
  ) {}

  /**
   * 指定されたURLリストからドキュメントを取得する
   * @param urls スクレイピング対象のURL配列
   * @returns 取得したドキュメントの配列
   */
  async scrapeDocuments(urls: string[]): Promise<Document[]> {
    const documents: Document[] = [];

    for (const url of urls) {
      try {
        // サーバーに負荷をかけないよう、リクエスト間隔を空ける
        await setTimeout(this.requestDelay);

        const doc = await this.scrapeDocument(url);
        documents.push(doc);

      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        // エラーが発生しても処理を継続
      }
    }

    return documents;
  }

  /**
   * 単一のURLからドキュメントを取得する
   * @param url スクレイピング対象のURL
   * @returns 取得したドキュメント
   */
  private async scrapeDocument(url: string): Promise<Document> {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // メタデータの取得
    const metadata: DocumentMetadata = {
      title: $('title').text().trim() || $('h1').first().text().trim(),
      lastUpdated: new Date(),
      category: this.extractCategory(url)
    };

    // 本文の取得
    // Note: セレクタは実際のHTMLに合わせて調整が必要
    const content = this.extractContent($);

    return new Document(url, content, metadata);
  }

  /**
   * HTMLから本文を抽出する
   * @param $ cheerioのインスタンス
   * @returns 抽出された本文
   */
  private extractContent($: cheerio.CheerioAPI): string {
    // Note: 以下のセレクタは例です。実際のHTMLに合わせて調整してください
    const mainContent = $('article').first()
      || $('.content')
      || $('.document-content')
      || $('main');

    if (!mainContent.length) {
      throw new Error('Content not found');
    }

    // 不要な要素を除去
    mainContent.find('script, style, nav, footer').remove();

    return mainContent.text().trim()
      .replace(/\s+/g, ' ')  // 連続した空白を1つに
      .replace(/\n+/g, '\n'); // 連続した改行を1つに
  }

  /**
   * URLからカテゴリを抽出する
   * 例: https://example.com/docs/api/auth → api
   * @param url 対象のURL
   * @returns 抽出されたカテゴリ
   */
  private extractCategory(url: string): string {
    try {
      const path = new URL(url).pathname;
      const segments = path.split('/').filter(Boolean);
      return segments.length > 1 ? segments[1] : 'general';
    } catch {
      return 'general';
    }
  }
}
