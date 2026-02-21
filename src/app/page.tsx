import Link from "next/link";

/** 収録ゲームの定義 */
const games = [
  {
    id: "concentration",
    title: "神経衰弱",
    description: "カードをめくってペアを見つけよう",
    emoji: "🃏",
  },
  {
    id: "high-and-low",
    title: "ハイ＆ロー",
    description: "次のカードは高い？低い？",
    emoji: "🔮",
  },
];

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
        <div className="flex flex-col gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/${game.id}`}
              className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{game.emoji}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{game.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{game.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
