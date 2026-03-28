import type { ConcentrationBestScore } from "@/types/concentration";
import type { HighAndLowBestScore } from "@/types/high-and-low";
import type { BlackjackBestScore } from "@/types/blackjack";
import type { PokerBestScore } from "@/types/poker";
import type { PyramidBestScore } from "@/types/pyramid";
import type { GolfBestScore } from "@/types/golf";
import type { SpiderBestScore } from "@/types/spider";
import type { TenPlayBestScore } from "@/types/ten-play";
import type { WarBestScore } from "@/types/war";
import type { TriPeaksBestScore } from "@/types/tri-peaks";

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

/** テンプレイのベストスコアをフォーマット */
function formatTenPlayBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as TenPlayBestScore;
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

/** トライピークスのベストスコアをフォーマット */
function formatTriPeaksBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as TriPeaksBestScore;
    return `最高${best.score}pt`;
  } catch {
    return null;
  }
}

/** 戦争のベストスコアをフォーマット */
function formatWarBest(data: string): string | null {
  try {
    const best = JSON.parse(data) as WarBestScore;
    return `${best.rounds}ラウンドで勝利`;
  } catch {
    return null;
  }
}

/** ゲームIDに応じたベストスコア表示文字列を返す */
export function formatBestScore(gameId: string, data: string): string | null {
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
    case "ten-play":
      return formatTenPlayBest(data);
    case "tri-peaks":
      return formatTriPeaksBest(data);
    case "war":
      return formatWarBest(data);
    default:
      return null;
  }
}
