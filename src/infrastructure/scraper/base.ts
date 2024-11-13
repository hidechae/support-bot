import { Document, DocumentMetadata } from '../../domain/models/document';
import { ScraperConfig, ScrapingTarget } from './types';
import axios, { AxiosInstance } from 'axios';
import { setTimeout } from 'timers/promises';

/**
 * スクレイパーの基底クラス
 * 各サイト固有のスクレイピングロジックを実装するための抽象クラス
 */
export abstract class BaseScraper {
  protected client: AxiosInstance;

  constructor(
    protected readonly target: ScrapingTarget,
    protected readonly config: Partial<ScraperConfig> = {}
  ) {
    this.client = axios.create({
      baseURL: target.baseUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': target.baseUrl,
        'sec-ch-ua': '"Not?A_Brand";v="99", "Chromium";v="130"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        ...config.headers
      },
      timeout: 10000,
      maxRedirects: 5,
      withCredentials: true,  // Cookie を送信する
    });

    // インターセプターを追加してリダイレクトを処理
    this.client.interceptors.response.use(response => {
      return response;
    }, error => {
      if (error.response) {
        console.error('Response error:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data.substring(0, 200) // 最初の200文字だけ表示
        });
      }
      throw error;
    });
  }

  /**
   * 指定されたパスのドキュメントを全て取得する
   */
  async scrapeDocuments(): Promise<Document[]> {
    const documents: Document[] = [];

    for (const path of this.target.paths) {
      try {
        await setTimeout(this.config.requestDelay || 1000);
        const doc = await this.scrapeSingleDocument(path);
        if (doc) {
          documents.push(doc);
        }
      } catch (error) {
        console.error(`Failed to scrape ${path}:`, error);
      }
    }

    return documents;
  }

  /**
   * 単一のパスからドキュメントを取得する
   * サイト固有の実装が必要
   */
  protected abstract scrapeSingleDocument(path: string): Promise<Document | null>;

  /**
   * URLからカテゴリを抽出する
   */
  protected extractCategory(path: string): string {
    const segments = path.split('/').filter(Boolean);
    return segments.length > 1 ? segments[1] : 'general';
  }
}
