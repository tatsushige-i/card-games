import { describe, it, expect } from "vitest";
import {
  highAndLowReducer,
  initialHighAndLowState,
} from "../high-and-low-reducer";
import { INITIAL_SCORE, WIN_SCORE } from "../high-and-low-cards";
import type {
  HighAndLowState,
  PlayingCard,
} from "@/types/high-and-low";

/** テスト用のカードを作成する */
function card(value: number, id = 0): PlayingCard {
  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ] as const;
  return { id, suit: "spade", rank: ranks[value - 1], value };
}

/** テスト用のプレイ中状態を作成する */
function createPlayingState(
  overrides?: Partial<HighAndLowState>
): HighAndLowState {
  return {
    ...initialHighAndLowState,
    currentCard: card(5, 0),
    deck: [card(8, 1), card(3, 2), card(10, 3)],
    phase: "playing",
    cardsPlayed: 1,
    ...overrides,
  };
}

describe("START_GAME", () => {
  it("phaseをplayingに設定する", () => {
    const deck = [card(5, 0), card(8, 1), card(3, 2)];
    const state = highAndLowReducer(initialHighAndLowState, {
      type: "START_GAME",
      deck,
    });
    expect(state.phase).toBe("playing");
  });

  it("デッキの先頭をcurrentCardに設定する", () => {
    const deck = [card(5, 0), card(8, 1), card(3, 2)];
    const state = highAndLowReducer(initialHighAndLowState, {
      type: "START_GAME",
      deck,
    });
    expect(state.currentCard).toEqual(card(5, 0));
    expect(state.deck).toHaveLength(2);
  });

  it("スコアを初期値に設定する", () => {
    const deck = [card(5, 0), card(8, 1)];
    const state = highAndLowReducer(initialHighAndLowState, {
      type: "START_GAME",
      deck,
    });
    expect(state.score).toBe(INITIAL_SCORE);
    expect(state.streak).toBe(0);
    expect(state.cardsPlayed).toBe(1);
  });
});

describe("GUESS", () => {
  it("highと予想して次のカードが高い場合、正解となりスコアが増える", () => {
    const state = createPlayingState({
      currentCard: card(5, 0),
      deck: [card(8, 1)],
      score: 3,
    });
    const next = highAndLowReducer(state, { type: "GUESS", guess: "high" });
    expect(next.lastResult).toBe("correct");
    expect(next.score).toBe(4);
    expect(next.streak).toBe(1);
    expect(next.phase).toBe("revealing");
  });

  it("lowと予想して次のカードが低い場合、正解となる", () => {
    const state = createPlayingState({
      currentCard: card(8, 0),
      deck: [card(3, 1)],
      score: 3,
    });
    const next = highAndLowReducer(state, { type: "GUESS", guess: "low" });
    expect(next.lastResult).toBe("correct");
    expect(next.score).toBe(4);
  });

  it("highと予想して次のカードが低い場合、不正解となりスコアが減る", () => {
    const state = createPlayingState({
      currentCard: card(8, 0),
      deck: [card(3, 1)],
      score: 3,
    });
    const next = highAndLowReducer(state, { type: "GUESS", guess: "high" });
    expect(next.lastResult).toBe("incorrect");
    expect(next.score).toBe(2);
    expect(next.streak).toBe(0);
  });

  it("同値の場合は引き分けとなりスコアが変わらない", () => {
    const state = createPlayingState({
      currentCard: card(5, 0),
      deck: [card(5, 1)],
      score: 3,
      streak: 2,
    });
    const nextHigh = highAndLowReducer(state, {
      type: "GUESS",
      guess: "high",
    });
    expect(nextHigh.lastResult).toBe("draw");
    expect(nextHigh.score).toBe(3);
    expect(nextHigh.streak).toBe(2);

    const nextLow = highAndLowReducer(state, {
      type: "GUESS",
      guess: "low",
    });
    expect(nextLow.lastResult).toBe("draw");
    expect(nextLow.score).toBe(3);
    expect(nextLow.streak).toBe(2);
  });

  it("連続正解でstreakとmaxStreakが更新される", () => {
    const state = createPlayingState({
      currentCard: card(3, 0),
      deck: [card(8, 1)],
      streak: 4,
      maxStreak: 4,
    });
    const next = highAndLowReducer(state, { type: "GUESS", guess: "high" });
    expect(next.streak).toBe(5);
    expect(next.maxStreak).toBe(5);
  });

  it("不正解でstreakがリセットされるがmaxStreakは保持される", () => {
    const state = createPlayingState({
      currentCard: card(8, 0),
      deck: [card(3, 1)],
      streak: 5,
      maxStreak: 5,
    });
    const next = highAndLowReducer(state, { type: "GUESS", guess: "high" });
    expect(next.streak).toBe(0);
    expect(next.maxStreak).toBe(5);
  });

  it("nextCardとデッキが正しく更新される", () => {
    const state = createPlayingState({
      deck: [card(8, 1), card(3, 2), card(10, 3)],
    });
    const next = highAndLowReducer(state, { type: "GUESS", guess: "high" });
    expect(next.nextCard).toEqual(card(8, 1));
    expect(next.deck).toHaveLength(2);
    expect(next.cardsPlayed).toBe(2);
  });

  it("正解時にcurrentCardがplayedCardsに追加される", () => {
    const state = createPlayingState({
      currentCard: card(5, 0),
      deck: [card(8, 1)],
      playedCards: [],
    });
    const next = highAndLowReducer(state, { type: "GUESS", guess: "high" });
    expect(next.playedCards).toHaveLength(1);
    expect(next.playedCards[0]).toEqual(card(5, 0));
  });

  it("不正解時にplayedCardsがリセットされる", () => {
    const state = createPlayingState({
      currentCard: card(8, 0),
      deck: [card(3, 1)],
      playedCards: [card(2, 10), card(4, 11)],
    });
    const next = highAndLowReducer(state, { type: "GUESS", guess: "high" });
    expect(next.playedCards).toHaveLength(0);
  });

  it("引き分け時にplayedCardsがリセットされる", () => {
    const state = createPlayingState({
      currentCard: card(5, 0),
      deck: [card(5, 1)],
      playedCards: [card(3, 10)],
    });
    const next = highAndLowReducer(state, { type: "GUESS", guess: "high" });
    expect(next.playedCards).toHaveLength(0);
  });

  it("playing以外のフェーズでは無視される", () => {
    const idleState = { ...initialHighAndLowState, phase: "idle" as const };
    expect(
      highAndLowReducer(idleState, { type: "GUESS", guess: "high" })
    ).toBe(idleState);

    const winState = createPlayingState({ phase: "win" });
    expect(
      highAndLowReducer(winState, { type: "GUESS", guess: "high" })
    ).toBe(winState);
  });
});

describe("REVEAL_COMPLETE", () => {
  it("スコアがWIN_SCORE以上のとき勝利になる", () => {
    const state: HighAndLowState = {
      ...createPlayingState(),
      phase: "revealing",
      score: WIN_SCORE,
      nextCard: card(10, 5),
    };
    const next = highAndLowReducer(state, { type: "REVEAL_COMPLETE" });
    expect(next.phase).toBe("win");
    expect(next.dialogOpen).toBe(true);
    expect(next.currentCard).toEqual(card(10, 5));
    expect(next.nextCard).toBeNull();
  });

  it("スコアが0以下のとき敗北になる", () => {
    const state: HighAndLowState = {
      ...createPlayingState(),
      phase: "revealing",
      score: 0,
      nextCard: card(2, 5),
    };
    const next = highAndLowReducer(state, { type: "REVEAL_COMPLETE" });
    expect(next.phase).toBe("lose");
    expect(next.dialogOpen).toBe(true);
  });

  it("デッキ切れの場合は勝利になる", () => {
    const state: HighAndLowState = {
      ...createPlayingState(),
      phase: "revealing",
      score: 5,
      deck: [],
      nextCard: card(7, 5),
    };
    const next = highAndLowReducer(state, { type: "REVEAL_COMPLETE" });
    expect(next.phase).toBe("win");
    expect(next.dialogOpen).toBe(true);
  });

  it("ゲーム続行の場合はplayingに戻る", () => {
    const state: HighAndLowState = {
      ...createPlayingState(),
      phase: "revealing",
      score: 5,
      nextCard: card(7, 5),
    };
    const next = highAndLowReducer(state, { type: "REVEAL_COMPLETE" });
    expect(next.phase).toBe("playing");
    expect(next.currentCard).toEqual(card(7, 5));
    expect(next.nextCard).toBeNull();
    expect(next.lastResult).toBeNull();
  });

  it("revealing以外のフェーズでは無視される", () => {
    const state = createPlayingState({ phase: "playing" });
    expect(
      highAndLowReducer(state, { type: "REVEAL_COMPLETE" })
    ).toBe(state);
  });
});

describe("SET_NEW_BEST", () => {
  it("isNewBestフラグを更新する", () => {
    const state = createPlayingState();
    const next = highAndLowReducer(state, {
      type: "SET_NEW_BEST",
      isNewBest: true,
    });
    expect(next.isNewBest).toBe(true);
  });
});

describe("DISMISS_DIALOG", () => {
  it("dialogOpenをfalseにする", () => {
    const state = createPlayingState({
      phase: "win",
      dialogOpen: true,
    });
    const next = highAndLowReducer(state, { type: "DISMISS_DIALOG" });
    expect(next.dialogOpen).toBe(false);
    expect(next.phase).toBe("win");
  });
});

describe("RESET", () => {
  it("初期状態に戻す", () => {
    const state = createPlayingState({ score: 8, streak: 5 });
    const next = highAndLowReducer(state, { type: "RESET" });
    expect(next).toEqual(initialHighAndLowState);
  });
});
