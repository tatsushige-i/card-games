"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import type { ConcentrationBestScore } from "@/types/concentration";
import type { HighAndLowBestScore } from "@/types/high-and-low";
import type { BlackjackBestScore } from "@/types/blackjack";
import type { PokerBestScore } from "@/types/poker";
import type { PyramidBestScore } from "@/types/pyramid";
import type { GolfBestScore } from "@/types/golf";
import type { SpiderBestScore } from "@/types/spider";

/** ゲーム定義 */
const games = [
  {
    id: "concentration",
    title: "神経衰弱",
    description: "カードをめくってペアを見つけよう",
    emoji: "🃏",
    storageKey: "concentration-best-score",
  },
  {
    id: "high-and-low",
    title: "ハイ＆ロー",
    description: "次のカードは高い？低い？",
    emoji: "🔮",
    storageKey: "high-and-low-best-score",
  },
  {
    id: "blackjack",
    title: "ブラックジャック",
    description: "21に近づけ！ディーラーに勝とう",
    emoji: "🂡",
    storageKey: "blackjack-best-score",
  },
  {
    id: "poker",
    title: "ビデオポーカー",
    description: "役を揃えてスコアを稼ごう",
    emoji: "🃑",
    storageKey: "poker-best-score",
  },
  {
    id: "pyramid",
    title: "ピラミッド",
    description: "合計13のペアを見つけて除去しよう",
    emoji: "🔺",
    storageKey: "pyramid-best-score",
  },
  {
    id: "golf",
    title: "ゴルフ",
    description: "±1のカードを連続で取り除こう",
    emoji: "⛳",
    storageKey: "golf-best-score",
  },
  {
    id: "spider",
    title: "スパイダー",
    description: "K〜Aの列を8組完成させよう",
    emoji: "🕷️",
    storageKey: "spider-best-score",
  },
] as const;

/** 神経衰弱のベストスコアをフォーマット */
function formatConcentrationBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as ConcentrationBestScore;
    return `${best.moves}回 / ${best.time}秒`;
  } catch {
    return null;
  }
}

/** ハイ＆ローのベストスコアをフォーマット */
function formatHighAndLowBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as HighAndLowBestScore;
    return `${best.maxStreak}連勝 / 最高${best.maxScore}pt`;
  } catch {
    return null;
  }
}

/** ブラックジャックのベストスコアをフォーマット */
function formatBlackjackBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as BlackjackBestScore;
    return `最大${best.maxWins}連勝`;
  } catch {
    return null;
  }
}

/** ビデオポーカーのベストスコアをフォーマット */
function formatPokerBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as PokerBestScore;
    return `最高${best.maxScore}pt`;
  } catch {
    return null;
  }
}

/** ピラミッドのベストスコアをフォーマット */
function formatPyramidBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as PyramidBestScore;
    if (typeof best.bestTime !== "number" || !Number.isFinite(best.bestTime)) {
      return null;
    }
    const m = Math.floor(best.bestTime / 60);
    const s = best.bestTime % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  } catch {
    return null;
  }
}

/** ゴルフのベストスコアをフォーマット */
function formatGolfBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as GolfBestScore;
    return `残り${best.remainingCards}枚`;
  } catch {
    return null;
  }
}

/** スパイダーのベストスコアをフォーマット */
function formatSpiderBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as SpiderBestScore;
    if (typeof best.bestMoves !== "number" || typeof best.bestTime !== "number") {
      return null;
    }
    const m = Math.floor(best.bestTime / 60);
    const s = best.bestTime % 60;
    const time = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `最少${best.bestMoves}手 / 最速${time}`;
  } catch {
    return null;
  }
}

/** ゲームIDに応じたベストスコア表示文字列を返す */
function formatBestScore(gameId: string, data: string): string | null {
  switch (gameId) {
    case "concentration":
      return formatConcentrationBest(data);
    case "high-and-low":
      return formatHighAndLowBest(data);
    case "blackjack":
      return formatBlackjackBest(data);
    case "poker":
      return formatPokerBest(data);
    case "pyramid":
      return formatPyramidBest(data);
    case "golf":
      return formatGolfBest(data);
    case "spider":
      return formatSpiderBest(data);
    default:
      return null;
  }
}

/** localStorageからベストスコア一覧を読み取る */
function readAllBestScores(): Record<string, string | null> {
  const scores: Record<string, string | null> = {};
  for (const game of games) {
    const data = localStorage.getItem(game.storageKey);
    scores[game.id] = data ? formatBestScore(game.id, data) : null;
  }
  return scores;
}

/** キャッシュ済みスナップショット（参照安定のため） */
let cachedScores: Record<string, string | null> = {};
let cacheInitialized = false;

function getSnapshot(): Record<string, string | null> {
  if (!cacheInitialized) {
    cachedScores = readAllBestScores();
    cacheInitialized = true;
  }
  return cachedScores;
}

function getServerSnapshot(): Record<string, string | null> {
  return {};
}

/** storageイベント・focusイベントで変更を検知して再読み込み */
function subscribe(callback: () => void) {
  // コンポーネント再マウント時にキャッシュを最新化（ナビゲーション後の反映）
  cachedScores = readAllBestScores();

  const onStorage = (e: StorageEvent) => {
    if (games.some((g) => g.storageKey === e.key)) {
      cachedScores = readAllBestScores();
      callback();
    }
  };

  const onFocus = () => {
    const newScores = readAllBestScores();
    const changed = games.some((g) => newScores[g.id] !== cachedScores[g.id]);
    if (changed) {
      cachedScores = newScores;
      callback();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", onFocus);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", onFocus);
  };
}

/** ホーム画面のゲーム一覧（ベストスコア表示付き） */
export function GameList() {
  const bestScores = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return (
    <div className="flex flex-col gap-4">
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/${game.id}`}
          className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">{game.emoji}</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-800">{game.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{game.description}</p>
              {bestScores[game.id] && (
                <p className="text-xs text-amber-600 font-medium mt-1.5">
                  🏆 ベスト: {bestScores[game.id]}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
