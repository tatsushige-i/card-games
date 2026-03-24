import type { Metadata } from "next";
import { TenPlayBoard } from "@/components/ten-play/ten-play-board";

export const metadata: Metadata = {
  title: "テンプレイ | カードゲーム",
  description: "合計10のペアを見つけて全カードを除去するソリティア",
};

export default function TenPlayPage() {
  return <TenPlayBoard />;
}
