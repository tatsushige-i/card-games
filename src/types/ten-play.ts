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
export type TenPlayPhase = "idle" | "playing" | "cleared" | "stuck";

/** ゲーム結果 */
export type TenPlayGameResult = "win" | "lose";

/** ゲームの状態 */
export type TenPlayState = {
  /** タブローのカード（13スロット、null=空） */
  tableau: (PlayingCard | null)[];
  /** 山札（初期39枚） */
  stock: PlayingCard[];
  /** 選択中のタブローインデックス */
  selectedIndices: number[];
  /** 除去回数 */
  removedCount: number;
  /** ゲームのフェーズ */
  phase: TenPlayPhase;
  /** ゲーム結果 */
  result: TenPlayGameResult | null;
  /** 経過時間（秒） */
  elapsedTime: number;
  /** 不正ペアインデックス（アニメ用） */
  invalidPair: number[] | null;
  /** 新記録かどうか */
  isNewBest: boolean;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア */
export type TenPlayBestScore = {
  /** 最短クリア時間（秒） */
  bestTime: number;
  /** 記録日 */
  date: string;
};

/** Reducerアクション */
export type TenPlayAction =
  | { type: "START_GAME"; deck: PlayingCard[] }
  | { type: "SELECT_CARD"; index: number }
  | { type: "CLEAR_INVALID" }
  | { type: "TICK" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESTART" };
