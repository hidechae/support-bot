import { SearchResult } from '../models/searchResult';
import { Document } from '../models/document';

/**
 * 検索結果からコンテキストを抽出するドメインサービス
 * 質問に対して最も関連性の高いドキュメントの選択を行う
 */
export class DocumentMatcher {
  /**
   * 検索結果から最適なコンテキストを選択する
   * @param searchResult ベクターDBからの検索結果
   * @param query ユーザーからの質問
   * @param minRelevanceScore 最小関連性スコア（0-1の範囲）
   * @returns 選択されたドキュメントの内容の配列
   */
  static selectRelevantContext(
    searchResult: SearchResult,
    query: string,
    minRelevanceScore: number
  ): string[] {
    // 検索結果が空の場合は空配列を返す
    if (searchResult.isEmpty()) {
      return [];
    }

    // スコアが閾値以上のドキュメントを取得
    const relevantDocs = searchResult.getBestMatches(minRelevanceScore);

    // 関連性の高い順に最大3件まで選択
    const selectedDocs = relevantDocs.slice(0, 3);
    return selectedDocs.map(doc => this.formatContext(doc));
  }

  /**
   * コンテキストとして使用するためにドキュメントを整形する
   * @param doc 対象のドキュメント
   * @returns 整形されたコンテキスト文字列
   */
  private static formatContext(doc: Document): string {
    const title = doc.metadata.title
      ? `タイトル: ${doc.metadata.title}\n`
      : '';

    return `${title}URL: ${doc.url}\n\n${doc.content}`;
  }

  /**
   * コンテキストが十分な情報を含んでいるかを判定する
   * @param context 選択されたコンテキスト
   * @returns 十分な情報が含まれている場合はtrue
   */
  static hasEnoughInformation(context: string[]): boolean {
    // 少なくとも1つのコンテキストが存在し、
    // 合計文字数が最小閾値を超えていることを確認
    const minLength = 50;
    return context.length > 0 &&
      context.join(' ').length >= minLength;
  }
}
