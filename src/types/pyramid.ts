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

/** ピラミッド上のカード */
export type PyramidCard = {
  /** 一意のID */
  id: number;
  /** スート */
  suit: Suit;
  /** ランク表示 */
  rank: Rank;
  /** 数値（A=1, 2-10=そのまま, J=11, Q=12, K=13） */
  value: number;
  /** ピラミッド内の段（0-6） */
  row: number;
  /** ピラミッド内の列 */
  col: number;
  /** 除去済みかどうか */
  removed: boolean;
};

/** ゲームのフェーズ */
export type PyramidPhase = "idle" | "playing" | "removing" | "complete";

/** ゲーム結果 */
export type PyramidGameResult = "win" | "lose";

/** ゲームの状態 */
export type PyramidState = {
  /** ピラミッドのカード（28枚） */
  pyramid: PyramidCard[];
  /** 山札（24枚） */
  stock: PlayingCard[];
  /** 捨て札 */
  waste: PlayingCard[];
  /** 選択中のカードID */
  selectedCardId: number | null;
  /** 選択カードのソース */
  selectedSource: "pyramid" | "waste" | null;
  /** ゲームのフェーズ */
  phase: PyramidPhase;
  /** ゲーム結果 */
  result: PyramidGameResult | null;
  /** 経過時間（秒） */
  elapsedTime: number;
  /** 除去したペア数 */
  removedPairs: number;
  /** 山札のリサイクル回数（最大1回） */
  stockRecycles: number;
  /** 不正ペアのカードID（shakeアニメ用） */
  invalidPair: number[] | null;
  /** 新記録かどうか */
  isNewBest: boolean;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア */
export type PyramidBestScore = {
  /** 最短クリア時間（秒） */
  bestTime: number;
};

/** Reducerアクション */
export type PyramidAction =
  | { type: "START_GAME"; deck: PlayingCard[] }
  | { type: "SELECT_CARD"; cardId: number; source: "pyramid" | "waste" }
  | { type: "DESELECT" }
  | { type: "DRAW_STOCK" }
  | { type: "RECYCLE_STOCK" }
  | { type: "REMOVE_COMPLETE" }
  | { type: "TICK" }
  | { type: "CLEAR_INVALID" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESET" };
