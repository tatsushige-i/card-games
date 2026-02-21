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
  /** 数値（A=11, 2-10=そのまま, J/Q/K=10） */
  value: number;
};

/** ゲームのフェーズ */
export type BlackjackPhase =
  | "idle"
  | "dealing"
  | "playing"
  | "dealerTurn"
  | "result"
  | "gameOver";

/** ゲーム結果 */
export type GameResult = "win" | "lose" | "draw" | "blackjack";

/** ゲームの状態 */
export type BlackjackState = {
  /** デッキ（残りカード） */
  deck: PlayingCard[];
  /** プレイヤーの手札 */
  playerHand: PlayingCard[];
  /** ディーラーの手札 */
  dealerHand: PlayingCard[];
  /** ディーラーのホールカードを公開しているか */
  dealerRevealed: boolean;
  /** ゲームのフェーズ */
  phase: BlackjackPhase;
  /** ゲーム結果 */
  result: GameResult | null;
  /** 現在の連勝数 */
  wins: number;
  /** 最大連勝数 */
  maxWins: number;
  /** 現在のラウンド数 */
  rounds: number;
  /** 新記録かどうか */
  isNewBest: boolean;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア */
export type BlackjackBestScore = {
  /** 最大連勝数 */
  maxWins: number;
};

/** Reducerアクション */
export type BlackjackAction =
  | { type: "START_GAME"; deck: PlayingCard[] }
  | { type: "DEAL_COMPLETE" }
  | { type: "HIT" }
  | { type: "STAND" }
  | { type: "DEALER_DRAW" }
  | { type: "SHOW_RESULT" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "NEXT_ROUND" }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESET" };
