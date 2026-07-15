"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { formatCountdown, millisecondsUntilNextUtc } from "@/lib/game/date";

export function Countdown({ compact = false }: { compact?: boolean }) {
  const [remaining, setRemaining] = useState(() => millisecondsUntilNextUtc());
  useEffect(() => {
    const interval = window.setInterval(() => {
      const next = millisecondsUntilNextUtc();
      setRemaining(next);
      if (next <= 1000) window.location.reload();
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <span suppressHydrationWarning className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground" aria-label={`Next puzzle in ${formatCountdown(remaining)}`}>
      <Clock3 className="size-3.5" aria-hidden="true" />
      {!compact && <span className="hidden sm:inline">Next puzzle</span>}
      <time suppressHydrationWarning>{formatCountdown(remaining)}</time>
    </span>
  );
}
