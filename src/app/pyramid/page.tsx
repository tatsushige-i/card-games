import type { Metadata } from "next";
import { PyramidBoard } from "@/components/pyramid/pyramid-board";

export const metadata: Metadata = {
  title: "ピラミッド | カードゲーム",
  description: "合計13のペアを見つけてピラミッドを崩すソリティア",
};

export default function PyramidPage() {
  return <PyramidBoard />;
}
