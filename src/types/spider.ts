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

/** スパイダーソリティアのカード（表裏状態付き） */
export type SpiderCard = {
  /** 一意のID */
  id: number;
  /** スート */
  suit: Suit;
  /** ランク表示 */
  rank: Rank;
  /** 数値（A=1, 2-10=そのまま, J=11, Q=12, K=13） */
  value: number;
  /** 表向きかどうか */
  faceUp: boolean;
};

/** ゲームのフェーズ */
export type SpiderPhase = "idle" | "playing" | "cleared" | "gameOver";

/** ゲーム結果 */
export type SpiderGameResult = "win" | "lose";

/** ゲームの状態 */
export type SpiderState = {
  /** 10列のカード */
  columns: SpiderCard[][];
  /** 山札 */
  stock: SpiderCard[];
  /** 完成セット数（目標: 8） */
  completedSets: number;
  /** 手数 */
  moves: number;
  /** ゲームのフェーズ */
  phase: SpiderPhase;
  /** ゲーム結果 */
  result: SpiderGameResult | null;
  /** 経過時間（秒） */
  elapsedTime: number;
  /** 選択中の列インデックス */
  selectedColumn: number | null;
  /** 選択中のカードインデックス（列内） */
  selectedCardIndex: number | null;
  /** 手数の新記録かどうか */
  isNewBestMoves: boolean;
  /** タイムの新記録かどうか */
  isNewBestTime: boolean;
  /** ダイアログの表示状態 */
  dialogOpen: boolean;
};

/** ベストスコア（最短手数・最短タイムは独立して記録） */
export type SpiderBestScore = {
  /** 最短手数 */
  bestMoves: number;
  /** 最短手数の記録日 */
  bestMovesDate: string;
  /** 最短タイム（秒） */
  bestTime: number;
  /** 最短タイムの記録日 */
  bestTimeDate: string;
};

/** Reducerアクション */
export type SpiderAction =
  | { type: "START_GAME"; deck: SpiderCard[] }
  | { type: "SELECT_CARD"; columnIndex: number; cardIndex: number }
  | { type: "MOVE_CARDS"; targetColumn: number }
  | { type: "DEAL_ROW" }
  | { type: "DESELECT" }
  | { type: "TICK" }
  | { type: "GIVE_UP" }
  | { type: "SET_NEW_BEST"; isNewBestMoves: boolean; isNewBestTime: boolean }
  | { type: "DISMISS_DIALOG" }
  | { type: "RESTART" };
