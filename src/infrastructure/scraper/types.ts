export interface ScrapingTarget {
  baseUrl: string;
  paths: string[];
}

export interface ScraperConfig {
  requestDelay: number;  // ms
  maxRetries: number;
  headers: Record<string, string>;
  timeout: number;
}
