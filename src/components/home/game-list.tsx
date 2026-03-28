"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { formatBestScore } from "./format-best-score";

/** カテゴリ定義 */
const categories = [
  { id: "casino", label: "カジノ系", emoji: "🎰" },
  { id: "puzzle", label: "パズル系", emoji: "🧩" },
] as const;

type Category = (typeof categories)[number]["id"];

/** ゲーム定義 */
const games = [
  {
    id: "concentration",
    title: "神経衰弱",
    description: "カードをめくってペアを見つけよう",
    emoji: "🃏",
    storageKey: "concentration-best-score",
    category: "puzzle",
  },
  {
    id: "high-and-low",
    title: "ハイ＆ロー",
    description: "次のカードは高い？低い？",
    emoji: "🔮",
    storageKey: "high-and-low-best-score",
    category: "casino",
  },
  {
    id: "blackjack",
    title: "ブラックジャック",
    description: "21に近づけ！ディーラーに勝とう",
    emoji: "🂡",
    storageKey: "blackjack-best-score",
    category: "casino",
  },
  {
    id: "poker",
    title: "ビデオポーカー",
    description: "役を揃えてスコアを稼ごう",
    emoji: "🃑",
    storageKey: "poker-best-score",
    category: "casino",
  },
  {
    id: "pyramid",
    title: "ピラミッド",
    description: "合計13のペアを見つけて除去しよう",
    emoji: "🔺",
    storageKey: "pyramid-best-score",
    category: "puzzle",
  },
  {
    id: "golf",
    title: "ゴルフ",
    description: "±1のカードを連続で取り除こう",
    emoji: "⛳",
    storageKey: "golf-best-score",
    category: "puzzle",
  },
  {
    id: "spider",
    title: "スパイダー",
    description: "K〜Aの列を8組完成させよう",
    emoji: "🕷️",
    storageKey: "spider-best-score",
    category: "puzzle",
  },
  {
    id: "ten-play",
    title: "テンプレイ",
    description: "合計10のペアを見つけて除去しよう",
    emoji: "🔟",
    storageKey: "ten-play-best-score",
    category: "puzzle",
  },
  {
    id: "tri-peaks",
    title: "トライピークス",
    description: "±1のカードを連続で取り除こう",
    emoji: "🏔️",
    storageKey: "tri-peaks-best-score",
    category: "puzzle",
  },
  {
    id: "war",
    title: "戦争",
    description: "カードを出して数値で勝負！",
    emoji: "⚔️",
    storageKey: "war-best-score",
    category: "casino",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  description: string;
  emoji: string;
  storageKey: string;
  category: Category;
}>;

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
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryGames = games.filter((g) => g.category === category.id);
        return (
          <section key={category.id}>
            <h2 className="text-lg font-bold text-gray-700 mb-3">
              {category.emoji} {category.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/${game.id}`}
                  className="glass rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{game.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {game.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {game.description}
                      </p>
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
          </section>
        );
      })}
    </div>
  );
}
