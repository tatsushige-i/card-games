import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlackjackCard } from "../blackjack-card";
import type { PlayingCard } from "@/types/blackjack";

describe("BlackjackCard", () => {
  const spadeAce: PlayingCard = {
    id: 0,
    suit: "spade",
    rank: "A",
    value: 11,
  };
  const heartTen: PlayingCard = {
    id: 1,
    suit: "heart",
    rank: "10",
    value: 10,
  };

  it("裏向きのカードを表示する", () => {
    render(<BlackjackCard card={null} faceDown />);
    expect(screen.getByRole("img")).toHaveAccessibleName("裏向きのカード");
  });

  it("表向きのカードにスートとランクのaria-labelを持つ", () => {
    render(<BlackjackCard card={spadeAce} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("♠A");
  });

  it("ランクテキストを表示する", () => {
    render(<BlackjackCard card={heartTen} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("♥")).toBeInTheDocument();
  });

  it("cardとfaceDownが両方ない場合は何も描画しない", () => {
    const { container } = render(<BlackjackCard card={null} />);
    expect(container.firstChild).toBeNull();
  });
});
