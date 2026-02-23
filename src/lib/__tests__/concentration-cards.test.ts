import { describe, it, expect } from "vitest";
import { shuffle, createCards, TOTAL_PAIRS } from "../concentration-cards";

describe("shuffle", () => {
  it("配列の長さを変えない", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).toHaveLength(arr.length);
  });

  it("同じ要素を含む", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.sort()).toEqual(arr.sort());
  });

  it("元の配列を変更しない", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffle(arr);
    expect(arr).toEqual(original);
  });
});

describe("createCards", () => {
  it("TOTAL_PAIRS * 2 枚のカードを生成する", () => {
    const cards = createCards();
    expect(cards).toHaveLength(TOTAL_PAIRS * 2);
  });

  it("各絵文字が正確に2枚ずつ存在する", () => {
    const cards = createCards();
    const emojiCount = new Map<string, number>();
    cards.forEach((card) => {
      emojiCount.set(card.emoji, (emojiCount.get(card.emoji) || 0) + 1);
    });
    emojiCount.forEach((count) => {
      expect(count).toBe(2);
    });
  });

  it("全てのカードが hidden 状態で初期化される", () => {
    const cards = createCards();
    cards.forEach((card) => {
      expect(card.status).toBe("hidden");
    });
  });

  it("全てのカードが一意のIDを持つ", () => {
    const cards = createCards();
    const ids = new Set(cards.map((c) => c.id));
    expect(ids.size).toBe(cards.length);
  });
});
