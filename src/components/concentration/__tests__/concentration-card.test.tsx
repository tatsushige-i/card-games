import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConcentrationCard } from "../concentration-card";
import type { ConcentrationCard as ConcentrationCardType } from "@/types/concentration";

describe("ConcentrationCard", () => {
  const defaultCard: ConcentrationCardType = { id: 0, emoji: "🍎", status: "hidden" };

  it("裏向きのカードを表示する", () => {
    render(<ConcentrationCard card={defaultCard} onFlip={vi.fn()} disabled={false} />);
    expect(screen.getByRole("button")).toHaveAccessibleName("裏向きのカード");
  });

  it("クリックでonFlipが呼ばれる", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    render(<ConcentrationCard card={defaultCard} onFlip={onFlip} disabled={false} />);
    await user.click(screen.getByRole("button"));
    expect(onFlip).toHaveBeenCalledWith(0);
  });

  it("flipped状態の場合、絵文字がaria-labelに含まれる", () => {
    const card: ConcentrationCardType = { id: 0, emoji: "🍎", status: "flipped" };
    render(<ConcentrationCard card={card} onFlip={vi.fn()} disabled={false} />);
    expect(screen.getByRole("button")).toHaveAccessibleName("カード: 🍎");
  });

  it("disabled時はonFlipが呼ばれない", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    render(<ConcentrationCard card={defaultCard} onFlip={onFlip} disabled={true} />);
    await user.click(screen.getByRole("button"));
    expect(onFlip).not.toHaveBeenCalled();
  });

  it("matched状態のカードはクリックできない", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    const card: ConcentrationCardType = { id: 0, emoji: "🍎", status: "matched" };
    render(<ConcentrationCard card={card} onFlip={onFlip} disabled={false} />);
    await user.click(screen.getByRole("button"));
    expect(onFlip).not.toHaveBeenCalled();
  });
});
