import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { EasyModePanel } from "@/components/game/easy-mode-panel";

const summary = {
  setLabels: ["Set 10", "Set 11"], costs: [3, 4], health: { min: 800, max: 1_000 },
  attackDamage: { min: 50, max: 70 }, ranges: [2, 4], guaranteedTraits: ["Mage"], traitCombinationCount: 3,
};

describe("Easy mode panel", () => {
  it("toggles before the first guess and explains the assistance", async () => {
    const onModeChange = vi.fn();
    const { container } = render(<EasyModePanel mode="standard" locked={false} hasGuesses={false} possibleCount={100} totalCount={100} summary={null} recovery={false} completed={false} onModeChange={onModeChange} />);
    const toggle = screen.getByRole("switch", { name: "Easy mode" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(toggle.querySelector('[data-slot="switch-thumb"]')).toHaveClass("left-0.5", "translate-x-0");
    await userEvent.click(toggle);
    expect(onModeChange).toHaveBeenCalledWith("easy");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows deductions and locks after a guess", async () => {
    const { container } = render(<EasyModePanel mode="easy" locked hasGuesses possibleCount={12} totalCount={100} summary={summary} recovery={false} completed={false} onModeChange={vi.fn()} />);
    const toggle = screen.getByRole("switch", { name: "Easy mode" });
    expect(toggle).toBeDisabled();
    expect(toggle.querySelector('[data-slot="switch-thumb"]')).toHaveClass("left-0.5", "translate-x-[22px]");
    expect(screen.getByText("12 possibilities remaining · 88 eliminated")).toBeVisible();
    expect(screen.getByText("Always Mage")).toBeVisible();
    expect(screen.getByText(/locked after your first guess/i)).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("replaces the final possibility count with an explicit solved state", async () => {
    const { container } = render(<EasyModePanel mode="easy" locked hasGuesses possibleCount={1} totalCount={100} summary={summary} recovery={false} completed onModeChange={vi.fn()} />);
    expect(screen.getByText("Puzzle solved")).toBeVisible();
    expect(screen.getByText(/all clues confirmed/i)).toBeVisible();
    expect(screen.queryByText(/1 possibility remaining/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mode is locked/i)).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
