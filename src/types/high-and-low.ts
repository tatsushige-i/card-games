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
  /** 数値（比較用: A=1, 2=2, ..., K=13） */
  value: number;
};

/** プレイヤーの予想 */
export type Guess = "high" | "low";

/** 予想結果 */
export type GuessResult = "correct" | "incorrect" | "draw";

/** ゲームのフェーズ */
export type HighAndLowPhase =
  | "idle"
  | "playing"
  | "revealing"
  | "win"
  | "lose";

/** ゲームの状態 */
export type HighAndLowState = {
  /** デッキ（残りカード） */
  deck: PlayingCard[];
  /** 現在表示中のカード */
  currentCard: PlayingCard | null;
  /** 次のカード（revealing中に表示） */
  nextCard: PlayingCard | null;
  /** めくり済みのカード（表示用） */
  playedCards: PlayingCard[];
  /** 現在のスコア */
  score: number;
  /** 現在の連続正解数 */
  streak: number;
  /** 今回のゲームの最大連続正解数 */
  maxStreak: number;
  /** 直前の予想結果 */
  lastResult: GuessResult | null;
  /** ゲームのフェーズ */
  phase: HighAndLowPhase;
  /** 引いたカードの総数 */
  cardsPlayed: number;
  /** 新記録かどうか */
  isNewBest: boolean;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア */
export type HighAndLowBestScore = {
  /** 最大連続正解数 */
  maxStreak: number;
  /** 最高スコア */
  maxScore: number;
};

/** Reducerアクション */
export type HighAndLowAction =
  | { type: "START_GAME"; deck: PlayingCard[] }
  | { type: "GUESS"; guess: Guess }
  | { type: "REVEAL_COMPLETE" }
  | { type: "SET_NEW_BEST"; isNewBest: boolean }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESET" };
