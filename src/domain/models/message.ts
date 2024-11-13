/**
 * ユーザーとの対話メッセージを表すドメインモデル
 * Slackからの入力とそれに対する応答を管理する
 */
export class Message {
  /**
   * @param content メッセージの本文
   * @param context 応答生成時に参照するドキュメントのコンテキスト
   */
  constructor(
    public readonly content: string,
    public readonly context?: string[]
  ) {
    this.validate();
  }

  /**
   * メッセージの内容を検証する
   * @throws {Error} メッセージが不正な場合
   */
  private validate() {
    if (!this.content) {
      throw new Error('Message content is required');
    }
    if (this.content.length > 2000) {
      throw new Error('Message content must be less than 2000 characters');
    }
  }

  /**
   * メッセージが有効な内容かどうかを判定する
   * 空でなく、かつ最大文字数以内であることを確認
   */
  public isValid(): boolean {
    try {
      this.validate();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * メッセージにコンテキストが含まれているかどうかを判定する
   */
  public hasContext(): boolean {
    return this.context !== undefined && this.context.length > 0;
  }

  /**
   * メッセージの要約を取得する
   * ログ出力などで使用
   */
  public getSummary(): string {
    const maxLength = 50;
    const content = this.content.length > maxLength
      ? `${this.content.substring(0, maxLength)}...`
      : this.content;
    return `Message: ${content} (with${this.hasContext() ? '' : 'out'} context)`;
  }

  /**
   * メッセージをJSON形式に変換する
   * 永続化やAPI通信時に使用
   */
  public toJSON() {
    return {
      content: this.content,
      context: this.context,
      hasContext: this.hasContext()
    };
  }
}
