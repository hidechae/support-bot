// src/infrastructure/scraper/base.ts
import axios, { AxiosInstance } from 'axios';
import { Document } from '../../domain/models/document';
import { ScraperConfig, ScrapingTarget } from './types';
import { logger } from '../../utils/logger';
import { setTimeout } from 'timers/promises';
import { config } from '../../config';

/**
 * スクレイパーの基底クラス
 * 各サイト固有のスクレイピングロジックを実装するための抽象クラス
 */
export abstract class BaseScraper {
  protected client: AxiosInstance;

  constructor(
    protected readonly target: ScrapingTarget,
    protected readonly scraperConfig: Partial<ScraperConfig> = {}
  ) {
    const { userAgent, timeout } = config.scraping;

    this.client = axios.create({
      baseURL: target.baseUrl,
      headers: {
        'User-Agent': userAgent,
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
        ...scraperConfig.headers
      },
      timeout: scraperConfig.timeout || timeout,
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
    const errors: Array<{ path: string; error: any }> = [];
    let processedCount = 0;

    logger.info(`Starting to scrape ${this.target.paths.length} documents`);

    for (const path of this.target.paths) {
      try {
        // 進捗状況の表示
        processedCount++;
        const progressPercent = (processedCount / this.target.paths.length * 100).toFixed(1);
        logger.info(`Processing ${processedCount}/${this.target.paths.length} (${progressPercent}%): ${path}`);

        // リトライ処理を含むドキュメント取得
        const doc = await this.scrapeWithRetry(path);
        if (doc) {
          documents.push(doc);
        }

        // リクエスト間隔の制御
        if (processedCount < this.target.paths.length) {
          const delay = this.scraperConfig.requestDelay || config.scraping.baseDelay;
          logger.debug(`Waiting ${delay}ms before next request`);
          await setTimeout(delay);
        }

      } catch (error) {
        logger.error(`Failed to scrape ${path}:`, error);
        errors.push({ path, error });
      }
    }

    // 完了サマリーの出力
    this.logScrapingSummary(documents, errors);

    return documents;
  }

  private async scrapeWithRetry(path: string, maxRetries = config.scraping.maxRetries): Promise<Document | null> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.scrapeSingleDocument(path);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          logger.warn(`Attempt ${attempt} failed for ${path}, retrying in ${delay}ms...`);
          await setTimeout(delay);
        }
      }
    }

    logger.error(`All ${maxRetries} attempts failed for ${path}`);
    throw lastError;
  }

  private logScrapingSummary(documents: Document[], errors: Array<{ path: string; error: any }>) {
    const totalPaths = this.target.paths.length;
    const successCount = documents.length;
    const errorCount = errors.length;
    const successRate = ((successCount / totalPaths) * 100).toFixed(1);

    logger.info('\n=== Scraping Summary ===');
    logger.info(`Total paths processed: ${totalPaths}`);
    logger.info(`Successfully scraped: ${successCount} (${successRate}%)`);
    logger.info(`Failed: ${errorCount}`);

    if (errors.length > 0) {
      logger.info('\nFailed paths:');
      errors.forEach(({ path, error }) => {
        logger.error(`- ${path}: ${error.message}`);
      });
    }
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
