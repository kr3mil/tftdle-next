"use client";

import Image from "next/image";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CheckCircle2, Copy, Crown, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChampionSearch } from "./champion-search";
import { Countdown } from "./countdown";
import { EasyModePanel } from "./easy-mode-panel";
import { HowToPlayDialog, StatisticsDialog } from "./info-dialogs";
import { ClueLegend, ResultsBoard } from "./results-board";
import { RosterModeSelector } from "./roster-mode-selector";
import type { AssistMode, CatalogManifest, Champion, RosterMode } from "@/lib/game/types";
import { possibleChampions, summarizePossibilities } from "@/lib/game/easy";
import { answerForDate, championsForRoster, snapshotForDate } from "@/lib/game/selection";
import { puzzleNumber, utcDateKey } from "@/lib/game/date";
import { buildShareText } from "@/lib/game/share";
import { loadStoredGame, newGame, recordGuess, saveStoredGame, setAssistMode, type PersistedGame } from "@/lib/game/storage";

type State = { game: PersistedGame | null; notice: string; recovered: boolean };
type Action =
  | { type: "hydrate"; game: PersistedGame; recovered: boolean }
  | { type: "guess"; rosterMode: RosterMode; championId: string; correct: boolean; notice: string }
  | { type: "assist"; rosterMode: RosterMode; assistMode: AssistMode }
  | { type: "notice"; notice: string };

function reducer(state: State, action: Action): State {
  if (action.type === "hydrate") return { game: action.game, recovered: action.recovered, notice: action.recovered ? "Saved data was damaged, so today’s games were safely reset." : "" };
  if (action.type === "notice") return { ...state, notice: action.notice };
  if (action.type === "assist") return state.game ? {
    ...state,
    game: setAssistMode(state.game, action.rosterMode, action.assistMode),
    notice: `${action.assistMode === "easy" ? "Easy" : "Normal"} assistance selected for ${action.rosterMode === "standard" ? "Standard" : "Wild"}.`,
  } : state;
  if (!state.game) return state;
  return { ...state, game: recordGuess(state.game, action.rosterMode, action.championId, action.correct), notice: action.notice };
}

function answersForDate(manifest: CatalogManifest, date: string) {
  return {
    standard: answerForDate(manifest, date, "standard").id,
    wild: answerForDate(manifest, date, "wild").id,
  };
}

export function TftdleGame({ manifest }: { manifest: CatalogManifest }) {
  const [state, dispatch] = useReducer(reducer, { game: null, notice: "", recovered: false });
  const [rosterMode, setRosterMode] = useState<RosterMode>("standard");
  const [manualShare, setManualShare] = useState("");
  const [celebratedRoster, setCelebratedRoster] = useState<RosterMode | null>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const today = state.game?.dailyByRoster.standard.date ?? manifest.active.effectiveFromUtc;
  const snapshot = useMemo(() => snapshotForDate(manifest, today), [manifest, today]);
  const standardChampions = useMemo(() => championsForRoster(snapshot, "standard"), [snapshot]);
  const rosterChampions = useMemo(() => championsForRoster(snapshot, rosterMode), [rosterMode, snapshot]);
  const answers = useMemo(() => ({
    standard: answerForDate(manifest, today, "standard"),
    wild: answerForDate(manifest, today, "wild"),
  }), [manifest, today]);
  const answer = answers[rosterMode];
  const number = puzzleNumber(today);

  useEffect(() => {
    const currentDate = utcDateKey();
    const currentSnapshot = snapshotForDate(manifest, currentDate);
    const loaded = loadStoredGame(window.localStorage, currentDate, answersForDate(manifest, currentDate), currentSnapshot.champions);
    dispatch({ type: "hydrate", ...loaded });
  }, [manifest]);

  useEffect(() => {
    if (state.game) saveStoredGame(window.localStorage, state.game);
  }, [state.game]);

  const fallbackGame = useMemo(() => newGame(today, { standard: answers.standard.id, wild: answers.wild.id }), [answers, today]);
  const game = state.game ?? fallbackGame;
  const daily = game.dailyByRoster[rosterMode];
  const guesses = useMemo(() => daily.guesses.map((id) => rosterChampions.find((champion) => champion.id === id)).filter((champion): champion is Champion => Boolean(champion)), [daily.guesses, rosterChampions]);
  const displayedGuesses = [...guesses].reverse();
  const completed = daily.completed;
  const easyMode = daily.assistMode === "easy";
  const calculatedPossibilities = useMemo(() => possibleChampions(rosterChampions, guesses, answer), [answer, guesses, rosterChampions]);
  const candidateFailure = easyMode && calculatedPossibilities.length === 0;
  const possibilities = easyMode && !candidateFailure ? calculatedPossibilities : rosterChampions;
  const deductionSummary = useMemo(() => easyMode ? summarizePossibilities(possibilities) : null, [easyMode, possibilities]);
  const latestSetLabel = standardChampions[0]?.setLabel ?? "Latest set";

  useEffect(() => {
    if (!completed || celebratedRoster !== rosterMode) return;
    const frame = requestAnimationFrame(() => {
      const completion = completionRef.current;
      if (!completion) return;
      completion.focus({ preventScroll: true });
      completion.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [celebratedRoster, completed, rosterMode]);

  function changeRosterMode(nextMode: RosterMode) {
    setRosterMode(nextMode);
    setManualShare("");
    dispatch({ type: "notice", notice: `${nextMode === "standard" ? "Standard" : "Wild"} daily puzzle selected.` });
  }

  function makeGuess(champion: Champion) {
    const correct = champion.id === answer.id;
    if (correct) setCelebratedRoster(rosterMode);
    let notice = correct ? `${rosterMode === "standard" ? "Standard" : "Wild"} champion found!` : "Guess added.";
    if (easyMode && !correct) {
      const remaining = possibleChampions(rosterChampions, [...guesses, champion], answer).length;
      const eliminated = Math.max(0, possibilities.length - remaining);
      notice = `Guess added. ${remaining.toLocaleString()} possibilities remain; ${eliminated.toLocaleString()} eliminated.`;
    }
    dispatch({ type: "guess", rosterMode, championId: champion.id, correct, notice });
  }

  async function share() {
    const text = buildShareText(number, guesses, answer, rosterMode, daily.assistMode);
    try {
      await navigator.clipboard.writeText(text);
      setManualShare("");
      dispatch({ type: "notice", notice: "Results copied to your clipboard." });
    } catch {
      setManualShare(text);
      dispatch({ type: "notice", notice: "Clipboard access was unavailable. Copy the results below." });
    }
  }

  return (
    <main className="arena-grid min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg border border-primary/35 bg-primary/10 shadow-[inset_0_0_18px_oklch(0.76_0.13_79/0.12)]"><Swords className="size-5 text-primary" /></span><div><p className="text-xl font-bold tracking-tight">TFT<span className="text-primary">dle</span></p><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{rosterMode} daily #{number}</p></div></div>
          <div className="flex items-center gap-1"><span className="mr-2 hidden lg:inline-flex"><Countdown /></span><HowToPlayDialog /><StatisticsDialog stats={game.statsByRoster} today={today} /></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="border-primary/35 bg-primary/8 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Two daily puzzles · UTC reset</Badge>
          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">Can you find today’s <span className="text-primary">TFT champion?</span></h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">{rosterMode === "standard" ? `Standard features ${latestSetLabel}, the latest TFT roster.` : `Wild brings every champion version from Set 1 to ${latestSetLabel} into play.`} Complete one mode or challenge yourself to both.</p>
          <div className="mt-4 lg:hidden"><Countdown /></div>
        </section>

        <section className="mx-auto mt-8 max-w-3xl" aria-label={`${rosterMode === "standard" ? "Standard" : "Wild"} champion guess`}>
          <RosterModeSelector mode={rosterMode} latestSetLabel={latestSetLabel} standardCount={standardChampions.length} wildCount={snapshot.champions.length} completedByRoster={{ standard: game.dailyByRoster.standard.completed, wild: game.dailyByRoster.wild.completed }} onModeChange={changeRosterMode} />
          <div className="mt-3"><ChampionSearch champions={possibilities} guessedIds={daily.guesses} disabled={!state.game || completed} easyMode={easyMode} completed={completed} rosterMode={rosterMode} onGuess={makeGuess} /></div>
          <EasyModePanel assistMode={daily.assistMode} locked={daily.guesses.length > 0 || completed} hasGuesses={daily.guesses.length > 0} possibleCount={possibilities.length} totalCount={rosterChampions.length} summary={deductionSummary} recovery={candidateFailure} completed={completed} onAssistModeChange={(assistMode) => dispatch({ type: "assist", rosterMode, assistMode })} />
          <div className="mt-4"><ClueLegend /></div>
        </section>

        {completed && <Card ref={completionRef} role="status" aria-label="Puzzle complete" tabIndex={-1} className={`mx-auto mt-8 max-w-3xl border-success/45 bg-card/95 outline-none shadow-[0_0_60px_oklch(0.61_0.15_151/0.13)] focus-visible:ring-2 focus-visible:ring-success ${celebratedRoster === rosterMode ? "completion-reveal" : ""}`}><CardContent className="flex flex-col items-center p-6 text-center sm:p-8"><span className="grid size-14 place-items-center rounded-full border border-success/35 bg-success/12"><Crown className="size-8 text-success" /></span><p className="mt-3 font-mono text-xs uppercase tracking-[0.22em] text-success">{rosterMode === "standard" ? "Standard" : "Wild"} puzzle complete</p><div className="mt-2 flex gap-2"><Badge variant="outline" className="border-success/35 bg-success/8 text-success">{rosterMode === "standard" ? "Standard" : "Wild"}</Badge>{easyMode && <Badge variant="outline" className="border-primary/35 bg-primary/8 text-primary">Easy mode</Badge>}</div><h2 className="mt-2 text-2xl font-semibold">You found {answer.name}</h2><div className="mt-4 flex items-center gap-3"><Image src={answer.image} alt={`${answer.name} portrait`} width={72} height={72} className="size-18 rounded-xl border border-success/40 object-cover" /><div className="text-left"><p className="font-semibold">{answer.setLabel}</p><p className="text-sm text-muted-foreground">Solved in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}</p></div></div><Button className="mt-6 min-h-11 min-w-44" onClick={share}><Copy className="size-4" />Share results</Button><p className="mt-4"><Countdown /></p>{manualShare && <label className="mt-5 w-full text-left text-xs text-muted-foreground">Copy your results<textarea readOnly value={manualShare} onFocus={(event) => event.currentTarget.select()} className="mt-2 min-h-40 w-full rounded-lg border bg-background p-3 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-ring" /></label>}</CardContent></Card>}

        <div className="mx-auto mt-8 max-w-6xl"><ResultsBoard guesses={displayedGuesses} answer={answer} showSet={rosterMode === "wild"} /></div>

        <div className="mt-6 min-h-6 text-center" aria-live="polite">{state.notice && <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-accent" />{state.notice}</p>}</div>
      </div>

      <footer className="border-t bg-background/60"><div className="mx-auto max-w-6xl px-4 py-8 text-center text-xs leading-5 text-muted-foreground sm:px-6"><p>TFTdle is an independent fan project and is not endorsed by Riot Games. Teamfight Tactics and all related assets are trademarks of Riot Games, Inc.</p><p className="mt-2">Game data sourced from Riot Data Dragon and CommunityDragon. Your progress never leaves this device.</p></div></footer>
    </main>
  );
}
