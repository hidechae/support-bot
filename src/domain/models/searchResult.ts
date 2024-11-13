import { Document } from './document';

/**
 * ベクターDBでの検索結果を表すドメインモデル
 * ドキュメントと類似度スコアのペアを管理する
 */
export class SearchResult {
    constructor(
        /** 検索にマッチしたドキュメントの配列 */
        public readonly documents: Document[],
        /** 各ドキュメントの類似度スコア（0-1の範囲） */
        public readonly scores: number[]
    ) {
        this.validate();
    }

    /**
     * 検索結果の整合性を検証する
     * @throws {Error} ドキュメントとスコアの数が一致しない場合やスコアが不正な値の場合
     */
    private validate() {
        if (this.documents.length !== this.scores.length) {
            throw new Error('Documents and scores must have the same length');
        }

        if (this.scores.some(score => score < 0 || score > 1)) {
            throw new Error('Scores must be between 0 and 1');
        }
    }

    /**
     * 指定したスコアの閾値以上のドキュメントのみを取得する
     * @param threshold スコアの閾値（0-1の範囲）
     * @returns 閾値以上のスコアを持つドキュメントの配列
     */
    public getBestMatches(threshold: number): Document[] {
        return this.documents.filter((_, index) => this.scores[index] >= threshold);
    }

    /**
     * 検索結果が空かどうかを判定する
     */
    public isEmpty(): boolean {
        return this.documents.length === 0;
    }

    /**
     * スコアの高い順に指定した数のドキュメントを取得する
     * @param limit 取得する最大数
     * @returns ドキュメントとスコアのペアの配列（スコアの降順）
     */
    public getTopResults(limit: number): { document: Document; score: number }[] {
        return this.documents
            .map((doc, index) => ({
                document: doc,
                score: this.scores[index]
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * 検索結果をJSON形式に変換する
     * 永続化やAPI通信時に使用
     */
    public toJSON() {
        return {
            documents: this.documents.map(doc => doc.toJSON()),
            scores: this.scores
        };
    }
}

