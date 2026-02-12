/** カードの状態 */
export type CardStatus = "hidden" | "flipped" | "matched";

/** カード1枚の型 */
export type Card = {
  /** 一意のID */
  id: number;
  /** 絵文字（ペアのマッチングに使用） */
  emoji: string;
  /** カードの現在の状態 */
  status: CardStatus;
};

/** ゲームのフェーズ */
export type GamePhase = "idle" | "playing" | "complete";

/** ゲームの状態 */
export type GameState = {
  /** カードの配列 */
  cards: Card[];
  /** 現在めくられているカードのID（最大2枚） */
  flippedIds: number[];
  /** 試行回数 */
  moves: number;
  /** マッチしたペア数 */
  matchedPairs: number;
  /** 総ペア数 */
  totalPairs: number;
  /** ゲームのフェーズ */
  phase: GamePhase;
  /** 経過時間（秒） */
  elapsedTime: number;
  /** ベストスコアを更新したか */
  isNewBest: boolean;
  /** 完了ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア */
export type BestScore = {
  /** 最少試行回数 */
  moves: number;
  /** 最短時間（秒） */
  time: number;
};

/** Reducerアクション */
export type GameAction =
  | { type: "START_GAME"; cards: Card[] }
  | { type: "FLIP_CARD"; cardId: number }
  | { type: "CHECK_MATCH" }
  | { type: "TICK" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESET" };
