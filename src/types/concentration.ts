/** カードの状態 */
export type ConcentrationCardStatus = "hidden" | "flipped" | "matched";

/** カード1枚の型 */
export type ConcentrationCard = {
  /** 一意のID */
  id: number;
  /** 絵文字（ペアのマッチングに使用） */
  emoji: string;
  /** カードの現在の状態 */
  status: ConcentrationCardStatus;
};

/** ゲームのフェーズ */
export type ConcentrationPhase = "idle" | "playing" | "complete";

/** ゲームの状態 */
export type ConcentrationState = {
  /** カードの配列 */
  cards: ConcentrationCard[];
  /** 現在めくられているカードのID（最大2枚） */
  flippedIds: number[];
  /** 試行回数 */
  moves: number;
  /** マッチしたペア数 */
  matchedPairs: number;
  /** 総ペア数 */
  totalPairs: number;
  /** ゲームのフェーズ */
  phase: ConcentrationPhase;
  /** 経過時間（秒） */
  elapsedTime: number;
  /** ベストスコアを更新したか */
  isNewBest: boolean;
  /** 完了ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア */
export type ConcentrationBestScore = {
  /** 最少試行回数 */
  moves: number;
  /** 最短時間（秒） */
  time: number;
};

/** Reducerアクション */
export type ConcentrationAction =
  | { type: "START_GAME"; cards: ConcentrationCard[] }
  | { type: "FLIP_CARD"; cardId: number }
  | { type: "CHECK_MATCH" }
  | { type: "TICK" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESET" };
