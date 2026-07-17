import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { ResultsBoard } from "@/components/game/results-board";
import { TooltipProvider } from "@/components/ui/tooltip";
import { champion } from "./fixtures";

describe("results board", () => {
  it("provides non-color clue descriptions and has no axe violations", async () => {
    const answer = champion({ id: "answer", setOrder: 3 });
    const guess = champion({ id: "guess", setOrder: 2 });
    const { container } = render(<TooltipProvider><ResultsBoard guesses={[guess]} answer={answer} /></TooltipProvider>);
    expect(screen.getAllByLabelText(/Answer is higher/).length).toBeGreaterThan(0);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("omits the redundant Set clue in Standard mode", () => {
    const answer = champion({ id: "answer", setOrder: 17 });
    const guess = champion({ id: "guess", setOrder: 17 });
    render(<TooltipProvider><ResultsBoard guesses={[guess]} answer={answer} showSet={false} /></TooltipProvider>);
    expect(screen.queryByRole("columnheader", { name: "Set" })).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Traits" })).toBeVisible();
  });
});
