import type { Metadata } from "next";
import { ConcentrationBoard } from "@/components/concentration/concentration-board";

export const metadata: Metadata = {
  title: "神経衰弱 | カードゲーム",
  description: "カードをめくってペアを見つけるメモリーマッチゲーム",
};

export default function ConcentrationPage() {
  return <ConcentrationBoard />;
}
