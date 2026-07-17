import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { RosterModeSelector } from "@/components/game/roster-mode-selector";

describe("roster mode selector", () => {
  it("selects Wild while exposing counts and completion state accessibly", async () => {
    const onModeChange = vi.fn();
    const { container } = render(<RosterModeSelector mode="standard" latestSetLabel="Set 17" standardCount={60} wildCount={1484} completedByRoster={{ standard: true, wild: false }} onModeChange={onModeChange} />);
    expect(screen.getByRole("button", { name: /Standard.*Completed/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Set 17 · 60 champions/)).toBeVisible();
    expect(screen.getByText(/Sets 1–17 · 1,484 versions/)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: /Wild/i }));
    expect(onModeChange).toHaveBeenCalledWith("wild");
    expect(await axe(container)).toHaveNoViolations();
  });
});
