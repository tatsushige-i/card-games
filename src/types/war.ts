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
export type WarCard = {
  /** 一意のID */
  id: number;
  /** スート */
  suit: Suit;
  /** ランク表示 */
  rank: Rank;
  /** 数値（2=2, ..., 10=10, J=11, Q=12, K=13, A=14） */
  value: number;
};

/** ゲームのフェーズ */
export type WarPhase =
  | "ready"
  | "battle"
  | "result"
  | "war"
  | "warReveal"
  | "gameOver";

/** ラウンドの勝敗 */
export type RoundResult = "player" | "cpu" | "war";

/** 最終的な勝者 */
export type Winner = "player" | "cpu";

/** ゲームの状態 */
export type WarState = {
  /** ゲームのフェーズ */
  phase: WarPhase;
  /** プレイヤーの山札 */
  playerDeck: WarCard[];
  /** CPUの山札 */
  cpuDeck: WarCard[];
  /** プレイヤーが出したカード */
  playerCard: WarCard | null;
  /** CPUが出したカード */
  cpuCard: WarCard | null;
  /** 戦争時の場のカード（勝者が獲得する） */
  warPile: WarCard[];
  /** ラウンドの勝敗 */
  roundResult: RoundResult | null;
  /** ラウンド数 */
  roundCount: number;
  /** 最終的な勝者 */
  winner: Winner | null;
  /** 新記録かどうか */
  isNewBest: boolean;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア（勝利時のラウンド数、少ないほど良い） */
export type WarBestScore = {
  /** ラウンド数 */
  rounds: number;
  /** 記録日 */
  date: string;
};

/** Reducerアクション */
export type WarAction =
  | { type: "PLAY_CARD" }
  | { type: "RESOLVE_BATTLE" }
  | { type: "START_WAR" }
  | { type: "REVEAL_WAR_CARDS" }
  | { type: "COLLECT_CARDS" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESTART"; playerDeck: WarCard[]; cpuDeck: WarCard[] };
