export interface ScrapingTarget {
  baseUrl: string;
  paths: string[];
}

export interface ScraperConfig {
  requestDelay: number;
  maxRetries: number;
  headers: Record<string, string>;
}
