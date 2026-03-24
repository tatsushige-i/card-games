import type { Metadata } from "next";
import { PokerBoard } from "@/components/poker/poker-board";

export const metadata: Metadata = {
  title: "ビデオポーカー | カードゲーム",
  description: "役を揃えてスコアを稼ぐジャックスオアベターポーカー",
};

export default function PokerPage() {
  return <PokerBoard />;
}
