import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HighAndLowCard } from "../high-and-low-card";
import type { PlayingCard } from "@/types/high-and-low";

describe("HighAndLowCard", () => {
  const spadeAce: PlayingCard = {
    id: 0,
    suit: "spade",
    rank: "A",
    value: 1,
  };
  const heartTen: PlayingCard = {
    id: 1,
    suit: "heart",
    rank: "10",
    value: 10,
  };

  it("裏向きのカードを表示する", () => {
    render(<HighAndLowCard card={null} faceDown />);
    expect(screen.getByRole("img")).toHaveAccessibleName("裏向きのカード");
  });

  it("表向きのカードにスートとランクのaria-labelを持つ", () => {
    render(<HighAndLowCard card={spadeAce} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("♠A");
  });

  it("ランクテキストを表示する", () => {
    render(<HighAndLowCard card={heartTen} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("♥")).toBeInTheDocument();
  });

  it("正解ハイライトで緑のリングが適用される", () => {
    const { container } = render(
      <HighAndLowCard card={spadeAce} highlight="correct" />
    );
    const cardBack = container.querySelector(".card-back");
    expect(cardBack?.className).toContain("ring-emerald-400/60");
  });

  it("不正解ハイライトで赤のリングが適用される", () => {
    const { container } = render(
      <HighAndLowCard card={spadeAce} highlight="incorrect" />
    );
    const cardBack = container.querySelector(".card-back");
    expect(cardBack?.className).toContain("ring-red-400/60");
  });

  it("引き分けハイライトで黄色のリングが適用される", () => {
    const { container } = render(
      <HighAndLowCard card={spadeAce} highlight="draw" />
    );
    const cardBack = container.querySelector(".card-back");
    expect(cardBack?.className).toContain("ring-amber-400/60");
  });

  it("cardとfaceDownが両方ない場合は何も描画しない", () => {
    const { container } = render(<HighAndLowCard card={null} />);
    expect(container.firstChild).toBeNull();
  });
});
