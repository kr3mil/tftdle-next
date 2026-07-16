"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, CheckCircle2, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Champion } from "@/lib/game/types";

export function ChampionSearch({ champions, guessedIds, disabled, easyMode, completed, onGuess }: {
  champions: readonly Champion[];
  guessedIds: readonly string[];
  disabled: boolean;
  easyMode: boolean;
  completed: boolean;
  onGuess: (champion: Champion) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const available = useMemo(() => {
    const guessed = new Set(guessedIds);
    return champions.filter((champion) => !guessed.has(champion.id));
  }, [champions, guessedIds]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const matches = normalized ? available.filter((champion) => `${champion.name} ${champion.setLabel} ${champion.traits.map((trait) => trait.name).join(" ")}`.toLocaleLowerCase().includes(normalized)) : available;
    return matches.slice(0, 100);
  }, [available, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={completed ? "Puzzle complete" : "Choose a champion"}
          disabled={disabled}
          className="min-h-14 w-full justify-between border-primary/30 bg-card/90 px-4 text-base shadow-[0_0_30px_oklch(0.7_0.12_202/0.08)] hover:border-primary/60 hover:bg-card"
        >
          {completed
            ? <span className="flex items-center gap-3 text-success"><CheckCircle2 className="size-5" />Puzzle complete</span>
            : <span className="flex items-center gap-3 text-muted-foreground"><Search className="size-5" />Search champion or set…</span>}
          {!completed && <ChevronsUpDown className="size-4 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0"
        align="start"
        collisionPadding={16}
      >
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Try ‘Ahri’, ‘Set 10’, or a trait…" aria-label="Search champions" />
          <CommandList className="max-h-[min(28rem,calc(var(--radix-popover-content-available-height)-2.5rem))]">
            <CommandEmpty>{easyMode ? "No possible champions match that search." : "No champions match that search."}</CommandEmpty>
            <CommandGroup heading={easyMode ? `${available.length} possible champion versions` : `${visible.length}${visible.length < available.length ? "+" : ""} champion versions shown`}>
              {visible.map((champion) => (
                <CommandItem
                  key={champion.id}
                  value={`${champion.name} ${champion.setLabel} ${champion.traits.map((trait) => trait.name).join(" ")}`}
                  onSelect={() => { onGuess(champion); setOpen(false); setQuery(""); }}
                  className="group min-h-14 gap-3"
                >
                  <Image src={champion.image} alt="" width={44} height={44} className="size-11 rounded-lg border border-primary/25 object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{champion.name}</span>
                    <span data-slot="champion-metadata" className="block truncate text-xs text-muted-foreground group-data-[selected=true]:text-accent-foreground">{champion.setLabel} · {champion.traits.map((trait) => trait.name).join(" · ")}</span>
                  </span>
                  <Check className="size-4 opacity-0" aria-hidden="true" />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
