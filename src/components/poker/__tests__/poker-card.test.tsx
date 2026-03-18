import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokerCard } from "../poker-card";
import type { PlayingCard } from "@/types/poker";

describe("PokerCard", () => {
  const spadeAce: PlayingCard = {
    id: 0,
    suit: "spade",
    rank: "A",
    value: 14,
  };
  const heartTen: PlayingCard = {
    id: 1,
    suit: "heart",
    rank: "10",
    value: 10,
  };

  it("裏向きのカードを表示する", () => {
    render(<PokerCard card={null} faceDown />);
    expect(screen.getByRole("img")).toHaveAccessibleName("裏向きのカード");
  });

  it("表向きのカードにスートとランクのaria-labelを持つ", () => {
    render(<PokerCard card={spadeAce} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("♠A");
  });

  it("ホールド中のカードのaria-labelに「(ホールド中)」が付く", () => {
    render(<PokerCard card={spadeAce} held />);
    expect(screen.getByRole("img")).toHaveAccessibleName("♠A (ホールド中)");
  });

  it("ランクテキストとスートシンボルを表示する", () => {
    render(<PokerCard card={heartTen} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("♥")).toBeInTheDocument();
  });

  it("held=trueの時HOLDラベルがopacity-100になる", () => {
    render(<PokerCard card={spadeAce} held />);
    const holdLabel = screen.getByText("HOLD");
    expect(holdLabel).toHaveClass("opacity-100");
  });

  it("held=falseの時HOLDラベルがopacity-0になる", () => {
    render(<PokerCard card={spadeAce} />);
    const holdLabel = screen.getByText("HOLD");
    expect(holdLabel).toHaveClass("opacity-0");
  });

  it("held=trueの時-translate-y-2が適用される", () => {
    render(<PokerCard card={spadeAce} held />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("-translate-y-2");
  });

  it("clickable=trueの時onClickが発火する", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PokerCard card={spadeAce} clickable onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("clickable=falseの時onClickが発火しない", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PokerCard card={spadeAce} onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("cardがnullでfaceDown=falseの場合は何も描画しない", () => {
    const { container } = render(<PokerCard card={null} />);
    expect(container.firstChild).toBeNull();
  });
});
