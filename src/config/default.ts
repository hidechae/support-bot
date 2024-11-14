export default {
  scraping: {
    baseDelay: 2000,
    maxRetries: 3,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  },
  sites: {
    instagram: {
      baseUrl: 'https://developers.facebook.com',
      paths: [
        '/docs/instagram-api/guides/content-publishing',
        '/docs/instagram-api/reference'
      ]
    }
  },
  logging: {
    level: 'info',
    directory: './logs',
    maxFiles: 5,
    maxSize: '10m'
  }
} as const;
