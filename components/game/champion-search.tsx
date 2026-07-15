"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Champion } from "@/lib/game/types";

export function ChampionSearch({ champions, guessedIds, disabled, onGuess }: {
  champions: readonly Champion[];
  guessedIds: readonly string[];
  disabled: boolean;
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
          aria-label="Choose a champion"
          disabled={disabled}
          className="min-h-14 w-full justify-between border-primary/30 bg-card/90 px-4 text-base shadow-[0_0_30px_oklch(0.7_0.12_202/0.08)] hover:border-primary/60 hover:bg-card"
        >
          <span className="flex items-center gap-3 text-muted-foreground"><Search className="size-5" />Search champion or set…</span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[min(92vw,42rem)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Try ‘Ahri’, ‘Set 10’, or a trait…" aria-label="Search champions" />
          <CommandList className="max-h-[min(28rem,65vh)]">
            <CommandEmpty>No champions match that search.</CommandEmpty>
            <CommandGroup heading={`${visible.length}${visible.length < available.length ? "+" : ""} champion versions shown`}>
              {visible.map((champion) => (
                <CommandItem
                  key={champion.id}
                  value={`${champion.name} ${champion.setLabel} ${champion.traits.map((trait) => trait.name).join(" ")}`}
                  onSelect={() => { onGuess(champion); setOpen(false); setQuery(""); }}
                  className="min-h-14 gap-3"
                >
                  <Image src={champion.image} alt="" width={44} height={44} className="size-11 rounded-lg border border-primary/25 object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{champion.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{champion.setLabel} · {champion.traits.map((trait) => trait.name).join(" · ")}</span>
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
