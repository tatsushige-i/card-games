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

/** ゲームのフェーズ */
export type GolfPhase = "idle" | "playing" | "cleared" | "stuck";

/** ゲーム結果 */
export type GolfGameResult = "win" | "lose";

/** ゲームの状態 */
export type GolfState = {
  /** 7列のカード（各列最大5枚） */
  columns: PlayingCard[][];
  /** 山札 */
  stock: PlayingCard[];
  /** 捨て札 */
  waste: PlayingCard[];
  /** 除去済みカード数 */
  removedCount: number;
  /** ゲームのフェーズ */
  phase: GolfPhase;
  /** ゲーム結果 */
  result: GolfGameResult | null;
  /** 経過時間（秒） */
  elapsedTime: number;
  /** 新記録かどうか */
  isNewBest: boolean;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア */
export type GolfBestScore = {
  /** 残りカード数（少ないほど良い） */
  remainingCards: number;
  /** 記録日 */
  date: string;
};

/** Reducerアクション */
export type GolfAction =
  | { type: "START_GAME"; deck: PlayingCard[] }
  | { type: "DRAW" }
  | { type: "REMOVE_CARD"; columnIndex: number }
  | { type: "CHECK_STUCK" }
  | { type: "TICK" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESTART" };
