import type { Metadata } from "next";
import { HighAndLowBoard } from "@/components/high-and-low/high-and-low-board";

export const metadata: Metadata = {
  title: "ハイ＆ロー | カードゲーム",
  description: "次のカードが高いか低いかを予測するカードゲーム",
};

export default function HighAndLowPage() {
  return <HighAndLowBoard />;
}
