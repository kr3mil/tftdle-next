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
import type { CatalogManifest, Champion, GameMode } from "@/lib/game/types";
import { possibleChampions, summarizePossibilities } from "@/lib/game/easy";
import { answerForDate, snapshotForDate } from "@/lib/game/selection";
import { puzzleNumber, utcDateKey } from "@/lib/game/date";
import { buildShareText } from "@/lib/game/share";
import { loadStoredGame, newGame, recordGuess, saveStoredGame, setGameMode, type PersistedGame } from "@/lib/game/storage";

type State = { game: PersistedGame | null; notice: string; recovered: boolean };
type Action =
  | { type: "hydrate"; game: PersistedGame; recovered: boolean }
  | { type: "guess"; championId: string; correct: boolean; notice: string }
  | { type: "mode"; mode: GameMode }
  | { type: "notice"; notice: string };

function reducer(state: State, action: Action): State {
  if (action.type === "hydrate") return { game: action.game, recovered: action.recovered, notice: action.recovered ? "Saved data was damaged, so today’s game was safely reset." : "" };
  if (action.type === "notice") return { ...state, notice: action.notice };
  if (action.type === "mode") return state.game ? { ...state, game: setGameMode(state.game, action.mode), notice: `${action.mode === "easy" ? "Easy" : "Standard"} mode selected.` } : state;
  if (!state.game) return state;
  return { ...state, game: recordGuess(state.game, action.championId, action.correct), notice: action.notice };
}

export function TftdleGame({ manifest }: { manifest: CatalogManifest }) {
  const [state, dispatch] = useReducer(reducer, { game: null, notice: "", recovered: false });
  const [manualShare, setManualShare] = useState("");
  const [celebrateCompletion, setCelebrateCompletion] = useState(false);
  const completionRef = useRef<HTMLDivElement>(null);
  const today = state.game?.daily.date ?? manifest.active.effectiveFromUtc;
  const snapshot = useMemo(() => snapshotForDate(manifest, today), [manifest, today]);
  const answer = useMemo(() => answerForDate(manifest, today), [manifest, today]);
  const number = puzzleNumber(today);

  useEffect(() => {
    const currentDate = utcDateKey();
    const loaded = loadStoredGame(window.localStorage, currentDate, answerForDate(manifest, currentDate).id, snapshotForDate(manifest, currentDate).champions);
    dispatch({ type: "hydrate", ...loaded });
  }, [manifest]);

  useEffect(() => {
    if (state.game) saveStoredGame(window.localStorage, state.game);
  }, [state.game]);

  const guesses = useMemo(() => {
    if (!state.game) return [];
    return state.game.daily.guesses.map((id) => snapshot.champions.find((champion) => champion.id === id)).filter((champion): champion is Champion => Boolean(champion));
  }, [snapshot.champions, state.game]);
  const displayedGuesses = [...guesses].reverse();
  const completed = state.game?.daily.completed ?? false;
  const game = state.game ?? newGame(today, answer.id);
  const easyMode = game.daily.mode === "easy";
  const calculatedPossibilities = useMemo(() => possibleChampions(snapshot.champions, guesses, answer), [answer, guesses, snapshot.champions]);
  const candidateFailure = easyMode && calculatedPossibilities.length === 0;
  const possibilities = easyMode && !candidateFailure ? calculatedPossibilities : snapshot.champions;
  const deductionSummary = useMemo(() => easyMode ? summarizePossibilities(possibilities) : null, [easyMode, possibilities]);

  useEffect(() => {
    if (!completed || !celebrateCompletion) return;
    const frame = requestAnimationFrame(() => {
      const completion = completionRef.current;
      if (!completion) return;
      completion.focus({ preventScroll: true });
      completion.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [celebrateCompletion, completed]);

  function makeGuess(champion: Champion) {
    const correct = champion.id === answer.id;
    if (correct) setCelebrateCompletion(true);
    let notice = correct ? "Champion found!" : "Guess added.";
    if (easyMode && !correct) {
      const remaining = possibleChampions(snapshot.champions, [...guesses, champion], answer).length;
      const eliminated = Math.max(0, possibilities.length - remaining);
      notice = `Guess added. ${remaining.toLocaleString()} possibilities remain; ${eliminated.toLocaleString()} eliminated.`;
    }
    dispatch({ type: "guess", championId: champion.id, correct, notice });
  }

  async function share() {
    const text = buildShareText(number, guesses, answer, game.daily.mode);
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
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg border border-primary/35 bg-primary/10 shadow-[inset_0_0_18px_oklch(0.76_0.13_79/0.12)]"><Swords className="size-5 text-primary" /></span><div><p className="text-xl font-bold tracking-tight">TFT<span className="text-primary">dle</span></p><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Daily champion #{number}</p></div></div>
          <div className="flex items-center gap-1"><span className="mr-2 hidden lg:inline-flex"><Countdown /></span><HowToPlayDialog /><StatisticsDialog stats={game.stats} today={today} /></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="border-primary/35 bg-primary/8 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">All standard sets · UTC daily</Badge>
          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">Can you find today’s <span className="text-primary">TFT champion?</span></h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">Use each guess to compare the set, traits and battle stats. Every champion version from Set 1 to Set 17 is in play.</p>
          <div className="mt-4 lg:hidden"><Countdown /></div>
        </section>

        <section className="mx-auto mt-8 max-w-3xl" aria-label="Champion guess">
          <ChampionSearch champions={possibilities} guessedIds={game.daily.guesses} disabled={!state.game || completed} easyMode={easyMode} completed={completed} onGuess={makeGuess} />
          <EasyModePanel mode={game.daily.mode} locked={game.daily.guesses.length > 0 || completed} hasGuesses={game.daily.guesses.length > 0} possibleCount={possibilities.length} totalCount={snapshot.champions.length} summary={deductionSummary} recovery={candidateFailure} completed={completed} onModeChange={(mode) => dispatch({ type: "mode", mode })} />
          <div className="mt-4"><ClueLegend /></div>
        </section>

        {completed && <Card ref={completionRef} role="status" aria-label="Puzzle complete" tabIndex={-1} className={`mx-auto mt-8 max-w-3xl border-success/45 bg-card/95 outline-none shadow-[0_0_60px_oklch(0.61_0.15_151/0.13)] focus-visible:ring-2 focus-visible:ring-success ${celebrateCompletion ? "completion-reveal" : ""}`}><CardContent className="flex flex-col items-center p-6 text-center sm:p-8"><span className="grid size-14 place-items-center rounded-full border border-success/35 bg-success/12"><Crown className="size-8 text-success" /></span><p className="mt-3 font-mono text-xs uppercase tracking-[0.22em] text-success">Puzzle complete</p>{easyMode && <Badge variant="outline" className="mt-2 border-primary/35 bg-primary/8 text-primary">Easy mode</Badge>}<h2 className="mt-2 text-2xl font-semibold">You found {answer.name}</h2><div className="mt-4 flex items-center gap-3"><Image src={answer.image} alt={`${answer.name} portrait`} width={72} height={72} className="size-18 rounded-xl border border-success/40 object-cover" /><div className="text-left"><p className="font-semibold">{answer.setLabel}</p><p className="text-sm text-muted-foreground">Solved in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}</p></div></div><Button className="mt-6 min-h-11 min-w-44" onClick={share}><Copy className="size-4" />Share results</Button><p className="mt-4"><Countdown /></p>{manualShare && <label className="mt-5 w-full text-left text-xs text-muted-foreground">Copy your results<textarea readOnly value={manualShare} onFocus={(event) => event.currentTarget.select()} className="mt-2 min-h-40 w-full rounded-lg border bg-background p-3 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-ring" /></label>}</CardContent></Card>}

        <div className="mx-auto mt-8 max-w-6xl"><ResultsBoard guesses={displayedGuesses} answer={answer} /></div>

        <div className="mt-6 min-h-6 text-center" aria-live="polite">{state.notice && <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-accent" />{state.notice}</p>}</div>
      </div>

      <footer className="border-t bg-background/60"><div className="mx-auto max-w-6xl px-4 py-8 text-center text-xs leading-5 text-muted-foreground sm:px-6"><p>TFTdle is an independent fan project and is not endorsed by Riot Games. Teamfight Tactics and all related assets are trademarks of Riot Games, Inc.</p><p className="mt-2">Game data sourced from Riot Data Dragon and CommunityDragon. Your progress never leaves this device.</p></div></footer>
    </main>
  );
}
