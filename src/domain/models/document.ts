export interface DocumentMetadata {
    title?: string;
    lastUpdated: Date;
    category?: string;
}

/**
 * ドキュメントを表すドメインモデル
 * Webページからスクレイピングした情報を扱う
 */
export class Document {
    constructor(
        /** ドキュメントのURL */
        public readonly url: string,
        /** ドキュメントの本文 */
        public readonly content: string,
        /** ドキュメントのメタデータ */
        public readonly metadata: DocumentMetadata
    ) {
        this.validate();
    }

    /**
     * ドキュメントの必須項目を検証する
     * @throws {Error} 必須項目が不足している場合
     */
    private validate() {
        if (!this.url) throw new Error('URL is required');
        if (!this.content) throw new Error('Content is required');
        if (!this.metadata.lastUpdated) {
            throw new Error('Last updated date is required');
        }
    }

    /**
     * ドキュメントが古くなっているかどうかを判定する
     * @param thresholdDays 古いと判定する日数の閾値
     * @returns 指定した日数よりも古い場合はtrue
     */
    public isStale(thresholdDays: number): boolean {
        const now = new Date();
        const lastUpdated = new Date(this.metadata.lastUpdated);
        const diffDays = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > thresholdDays;
    }

    /**
     * ドキュメントをJSON形式に変換する
     * 永続化やAPI通信時に使用
     */
    public toJSON() {
        return {
            url: this.url,
            content: this.content,
            metadata: {
                ...this.metadata,
                lastUpdated: this.metadata.lastUpdated.toISOString()
            }
        };
    }
}

