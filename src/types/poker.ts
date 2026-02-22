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
  /** 数値（A=14, 2-10=そのまま, J=11, Q=12, K=13） */
  value: number;
};

/** ゲームのフェーズ */
export type PokerPhase =
  | "idle"
  | "dealing"
  | "holding"
  | "drawing"
  | "result"
  | "gameOver";

/** ポーカーの役 */
export type HandRank =
  | "royalFlush"
  | "straightFlush"
  | "fourOfAKind"
  | "fullHouse"
  | "flush"
  | "straight"
  | "threeOfAKind"
  | "twoPair"
  | "jacksOrBetter"
  | "noHand";

/** ゲームの状態 */
export type PokerState = {
  /** デッキ（残りカード） */
  deck: PlayingCard[];
  /** 手札（5枚） */
  hand: PlayingCard[];
  /** 各カードのホールド状態 */
  held: boolean[];
  /** ゲームのフェーズ */
  phase: PokerPhase;
  /** 判定された役 */
  handRank: HandRank | null;
  /** 現在のラウンドのスコア */
  roundScore: number;
  /** 合計スコア */
  totalScore: number;
  /** 現在のラウンド数 */
  round: number;
  /** 新記録かどうか */
  isNewBest: boolean;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア */
export type PokerBestScore = {
  /** 最高合計スコア */
  maxScore: number;
};

/** Reducerアクション */
export type PokerAction =
  | { type: "START_GAME"; deck: PlayingCard[] }
  | { type: "DEAL_COMPLETE" }
  | { type: "TOGGLE_HOLD"; index: number }
  | { type: "DRAW" }
  | { type: "DRAW_COMPLETE" }
  | { type: "SHOW_RESULT" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "NEXT_ROUND" }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESET" };
