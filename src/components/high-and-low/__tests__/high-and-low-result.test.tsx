import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HighAndLowResult } from "../high-and-low-result";

describe("HighAndLowResult", () => {
  it("resultがnullの場合は何も表示しない", () => {
    const { container } = render(<HighAndLowResult result={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("正解時のメッセージを表示する", () => {
    render(<HighAndLowResult result="correct" />);
    expect(screen.getByText(/正解！ \+1/)).toBeInTheDocument();
  });

  it("不正解時のメッセージを表示する", () => {
    render(<HighAndLowResult result="incorrect" />);
    expect(screen.getByText(/不正解\.\.\. -1/)).toBeInTheDocument();
  });

  it("引き分け時のメッセージを表示する", () => {
    render(<HighAndLowResult result="draw" />);
    expect(screen.getByText(/引き分け ±0/)).toBeInTheDocument();
  });
});
