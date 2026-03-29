import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="game-background flex flex-col items-center justify-center px-4 py-10 sm:py-16">
      <div className="glass rounded-2xl p-8 shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">
          ページが見つかりません
        </h1>
        <p className="text-sm text-gray-500 mt-3">
          お探しのページは存在しないか、移動した可能性があります。URLをご確認ください。
        </p>
        <div className="flex justify-center mt-6">
          <Button variant="outline" asChild>
            <Link href="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
