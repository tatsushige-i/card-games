import type { Metadata } from "next";
import { TriPeaksBoard } from "@/components/tri-peaks/tri-peaks-board";

export const metadata: Metadata = {
  title: "トライピークス | カードゲーム",
  description: "±1のカードを連続で取り除く3つのピラミッドソリティア",
};

export default function TriPeaksPage() {
  return <TriPeaksBoard />;
}
