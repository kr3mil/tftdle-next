"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="max-w-md rounded-xl border bg-card p-8 text-center shadow-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">Unexpected error</p>
        <h1 className="mt-3 text-2xl font-semibold">The arena failed to load</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your saved progress is still on this device. Try loading the game again.</p>
        <button className="mt-6 min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
