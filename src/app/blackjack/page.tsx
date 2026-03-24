import type { Metadata } from "next";
import { BlackjackBoard } from "@/components/blackjack/blackjack-board";

export const metadata: Metadata = {
  title: "ブラックジャック | カードゲーム",
  description: "ディーラーと1対1で21を目指すカードゲーム",
};

export default function BlackjackPage() {
  return <BlackjackBoard />;
}
