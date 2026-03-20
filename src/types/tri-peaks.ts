/** トランプのスート */
export type Suit = "spade" | "heart" | "diamond" | "club";

/** トランプのランク */
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

/** トランプカード1枚 */
export type PlayingCard = {
  /** 一意のID */
  id: number;
  /** スート */
  suit: Suit;
  /** ランク表示 */
  rank: Rank;
  /** 数値（A=1, 2-10=そのまま, J=11, Q=12, K=13） */
  value: number;
};

/** タブロー上のカード（位置情報付き） */
export type TriPeaksCard = PlayingCard & {
  /** 行（0-3） */
  row: number;
  /** 行内の位置 */
  pos: number;
  /** 除去済みか */
  removed: boolean;
};

/** ゲームのフェーズ */
export type TriPeaksPhase = "idle" | "playing" | "cleared" | "stuck";

/** ゲーム結果 */
export type TriPeaksGameResult = "win" | "lose";

/** ゲームの状態 */
export type TriPeaksState = {
  /** タブロー（28枚のカード） */
  tableau: TriPeaksCard[];
  /** 山札 */
  stock: PlayingCard[];
  /** 捨て札 */
  waste: PlayingCard[];
  /** 現在のスコア */
  score: number;
  /** 現在のコンボ数 */
  combo: number;
  /** 除去済みカード数 */
  removedCount: number;
  /** 経過時間（秒） */
  elapsedTime: number;
  /** ゲームのフェーズ */
  phase: TriPeaksPhase;
  /** ゲーム結果 */
  result: TriPeaksGameResult | null;
  /** 新記録かどうか */
  isNewBest: boolean;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア */
export type TriPeaksBestScore = {
  /** スコア（高いほど良い） */
  score: number;
  /** 記録日 */
  date: string;
};

/** Reducerアクション */
export type TriPeaksAction =
  | { type: "START_GAME"; deck: PlayingCard[] }
  | { type: "DRAW" }
  | { type: "REMOVE_CARD"; row: number; pos: number }
  | { type: "TICK" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESTART" };
