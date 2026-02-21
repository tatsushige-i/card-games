import { GameList } from "@/components/home/game-list";

export default function Home() {
  return (
    <div className="game-background flex flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-lg">
        {/* タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-800">
            カードゲーム
          </h1>
          <p className="text-sm text-gray-500 mt-2">遊びたいゲームを選んでください</p>
        </div>

        {/* ゲーム一覧 */}
        <GameList />
      </div>
    </div>
  );
}
