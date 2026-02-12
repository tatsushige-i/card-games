import type { Card } from "@/types/game";

/** ゲームに使用する絵文字一覧 */
const EMOJIS = ["🍎", "🌸", "🐬", "🌙", "⭐", "🎵", "💎", "🔥"];

/**
 * Fisher-Yatesアルゴリズムで配列をシャッフルする
 * 元の配列は変更しない
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * ゲーム用のカード配列を生成する
 * 各絵文字が2枚ずつ、シャッフルされた状態で返す
 */
export function createCards(): Card[] {
  const pairs = EMOJIS.flatMap((emoji, index) => [
    { id: index * 2, emoji, status: "hidden" as const },
    { id: index * 2 + 1, emoji, status: "hidden" as const },
  ]);
  return shuffle(pairs);
}

/** 総ペア数 */
export const TOTAL_PAIRS = EMOJIS.length;
