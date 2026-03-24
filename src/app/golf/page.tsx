import type { Metadata } from "next";
import { GolfBoard } from "@/components/golf/golf-board";

export const metadata: Metadata = {
  title: "ゴルフ | カードゲーム",
  description: "±1のカードを連続で取り除くソリティア",
};

export default function GolfPage() {
  return <GolfBoard />;
}
