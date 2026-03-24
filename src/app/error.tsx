"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="game-background flex flex-col items-center justify-center px-4 py-10 sm:py-16">
      <div className="glass rounded-2xl p-8 shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">
          エラーが発生しました
        </h1>
        <p className="text-sm text-gray-500 mt-3">
          予期しないエラーが発生しました。再試行するか、ホームに戻ってください。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
          <Button onClick={() => reset()}>再試行</Button>
          <Button variant="outline" asChild>
            <Link href="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
