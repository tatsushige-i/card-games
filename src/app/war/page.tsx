import type { Metadata } from "next";
import { WarBoard } from "@/components/war/war-board";

export const metadata: Metadata = {
  title: "戦争 | カードゲーム",
  description: "カードの数値を比べて勝負する対戦カードゲーム",
};

export default function WarPage() {
  return <WarBoard />;
}
