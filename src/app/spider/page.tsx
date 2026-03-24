import type { Metadata } from "next";
import { SpiderBoard } from "@/components/spider/spider-board";

export const metadata: Metadata = {
  title: "スパイダー | カードゲーム",
  description: "K〜Aの同スート列を8組完成させるソリティア",
};

export default function SpiderPage() {
  return <SpiderBoard />;
}
