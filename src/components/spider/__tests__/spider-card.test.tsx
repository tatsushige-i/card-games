import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpiderCardComponent } from "../spider-card";
import type { SpiderCard } from "@/types/spider";

describe("SpiderCardComponent", () => {
  const faceUpCard: SpiderCard = {
    id: 0,
    suit: "spade",
    rank: "A",
    value: 1,
    faceUp: true,
  };
  const faceDownCard: SpiderCard = {
    id: 1,
    suit: "spade",
    rank: "K",
    value: 13,
    faceUp: false,
  };

  it("裏向きカードを表示する（フルサイズ）", () => {
    render(<SpiderCardComponent card={faceDownCard} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("裏向きのカード");
  });

  it("表向きカードにスートとランクのaria-labelを持つ", () => {
    render(<SpiderCardComponent card={faceUpCard} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("♠A");
  });

  it("ランクテキストとスートシンボルを表示する", () => {
    const card10: SpiderCard = { ...faceUpCard, rank: "10", value: 10 };
    render(<SpiderCardComponent card={card10} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("♠")).toBeInTheDocument();
  });

  it("clickable=trueの時onClickが発火する", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SpiderCardComponent card={faceUpCard} clickable onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("clickable=falseの時ボタンにならない", () => {
    render(<SpiderCardComponent card={faceUpCard} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("selected=trueの時ring-2クラスが適用される", () => {
    render(<SpiderCardComponent card={faceUpCard} selected clickable />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("ring-2");
  });

  it("コンパクト表示でクリック可能な場合ボタンになる", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SpiderCardComponent card={faceUpCard} compact clickable onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
