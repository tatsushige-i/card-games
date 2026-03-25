import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokerGameOverDialog } from "../poker-game-over-dialog";
import { HAND_NAMES, HAND_PAYOUTS, MAX_ROUNDS } from "@/lib/poker-cards";

describe("PokerGameOverDialog", () => {
  const defaultProps = {
    open: true,
    handRank: "twoPair" as const,
    roundScore: HAND_PAYOUTS["twoPair"],
    totalScore: 15,
    round: 3,
    isNewBest: false,
    isLastRound: false,
    onNextRound: vi.fn(),
    onReset: vi.fn(),
    onClose: vi.fn(),
  };

  it("役成立時のタイトルを表示する", () => {
    render(<PokerGameOverDialog {...defaultProps} />);
    expect(
      screen.getByText(`🎊 ${HAND_NAMES["twoPair"]}！`)
    ).toBeInTheDocument();
  });

  it("ノーハンド時のタイトルを表示する", () => {
    render(
      <PokerGameOverDialog
        {...defaultProps}
        handRank={null}
        roundScore={0}
      />
    );
    expect(screen.getByText("😢 ノーハンド...")).toBeInTheDocument();
  });

  it("最終ラウンド時のタイトルを表示する", () => {
    render(<PokerGameOverDialog {...defaultProps} isLastRound={true} />);
    expect(screen.getByText("🎊 ゲーム終了！")).toBeInTheDocument();
  });

  it("最終ラウンド＋新記録時のタイトルを表示する", () => {
    render(
      <PokerGameOverDialog
        {...defaultProps}
        isLastRound={true}
        isNewBest={true}
      />
    );
    expect(
      screen.getByText("🎉 新記録！ゲーム終了！")
    ).toBeInTheDocument();
  });

  it("ロイヤルフラッシュ時のタイトルを表示する", () => {
    render(
      <PokerGameOverDialog {...defaultProps} handRank="royalFlush" />
    );
    expect(screen.getByText("👑 ロイヤルフラッシュ！")).toBeInTheDocument();
  });

  it("スタッツを表示する", () => {
    render(<PokerGameOverDialog {...defaultProps} />);
    expect(screen.getByText(`${defaultProps.roundScore}pt`)).toBeInTheDocument();
    expect(screen.getByText("今回の獲得")).toBeInTheDocument();
    expect(screen.getByText("15pt")).toBeInTheDocument();
    expect(screen.getByText("合計スコア")).toBeInTheDocument();
    expect(
      screen.getByText(`3/${MAX_ROUNDS}`)
    ).toBeInTheDocument();
    expect(screen.getByText("ラウンド")).toBeInTheDocument();
  });

  it("新記録メッセージを表示する", () => {
    render(
      <PokerGameOverDialog
        {...defaultProps}
        isLastRound={true}
        isNewBest={true}
      />
    );
    expect(
      screen.getByText("ベストスコアを更新しました！")
    ).toBeInTheDocument();
  });

  it("新記録でない場合はメッセージを非表示にする", () => {
    render(<PokerGameOverDialog {...defaultProps} />);
    expect(
      screen.queryByText("ベストスコアを更新しました！")
    ).not.toBeInTheDocument();
  });

  it("途中ラウンドで「次のラウンド」と「最初から」ボタンを表示する", () => {
    render(<PokerGameOverDialog {...defaultProps} />);
    expect(screen.getByText("次のラウンド")).toBeInTheDocument();
    expect(screen.getByText("最初から")).toBeInTheDocument();
  });

  it("最終ラウンドでは「次のラウンド」を非表示にする", () => {
    render(<PokerGameOverDialog {...defaultProps} isLastRound={true} />);
    expect(screen.queryByText("次のラウンド")).not.toBeInTheDocument();
    expect(screen.getByText("最初から")).toBeInTheDocument();
  });

  it("「次のラウンド」クリックでonNextRoundが呼ばれる", async () => {
    const user = userEvent.setup();
    const onNextRound = vi.fn();
    render(
      <PokerGameOverDialog {...defaultProps} onNextRound={onNextRound} />
    );
    await user.click(screen.getByText("次のラウンド"));
    expect(onNextRound).toHaveBeenCalledTimes(1);
  });

  it("「最初から」クリックでonResetが呼ばれる", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<PokerGameOverDialog {...defaultProps} onReset={onReset} />);
    await user.click(screen.getByText("最初から"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
