"use client";

import { CURRENT_USER } from "@/lib/constants/navigation";
import { useNow } from "@/lib/hooks/useNow";
import { greetingFor } from "@/lib/utils/format";

export function Greeting() {
  const now = useNow();
  const greeting = now ? greetingFor(now) : "Selamat pagi";
  return (
    <>
      {greeting}, {CURRENT_USER.name}
    </>
  );
}
