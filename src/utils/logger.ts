import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      // エラーオブジェクトがある場合はスタックトレースを含める
      return `${timestamp} [${level}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level}]: ${message}`;
  })
);

// logsディレクトリが無い場合に作成
const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

export const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // コンソールへの出力
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // エラーログ
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // 全ログ
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// 開発環境の場合は詳細なログを出力
if (process.env.NODE_ENV !== 'production') {
  logger.level = 'debug';
}