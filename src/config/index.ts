import * as dotenv from 'dotenv';
import { z } from 'zod';
import defaultConfig from './default';

// 環境変数の読み込み
dotenv.config();

// シークレット情報のスキーマ
const secretsSchema = z.object({
  slack: z.object({
    token: z.string().optional(),
    appToken: z.string().optional(),
    signingSecret: z.string().optional()
  }),
  openai: z.object({
    apiKey: z.string().optional()
  })
});

// 設定全体のスキーマ
const configSchema = z.object({
  scraping: z.object({
    baseDelay: z.number(),
    maxRetries: z.number(),
    timeout: z.number(),
    userAgent: z.string()
  }),
  sites: z.object({
    instagram: z.object({
      baseUrl: z.string(),
      paths: z.array(z.string())
    })
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']),
    directory: z.string(),
    maxFiles: z.number(),
    maxSize: z.string()
  }),
  secrets: secretsSchema
});

// 環境変数からシークレット情報を取得
const secrets = secretsSchema.parse({
  slack: {
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  }
});

// 設定をマージして最終的な設定オブジェクトを作成
export const config = configSchema.parse({
  ...defaultConfig,
  secrets
});

// 型定義のエクスポート
export type Config = typeof config;
