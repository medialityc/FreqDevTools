"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { voteSkill } from "@/actions/skills";
import { cn } from "@/lib/utils";

export function VoteButtons({
  skillId,
  initialScore,
  initialUserVote,
  isLoggedIn,
}: {
  skillId: string;
  initialScore: number;
  initialUserVote: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [, startTransition] = useTransition();

  function vote(value: 1 | -1) {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/skills/${skillId}`);
      return;
    }
    // Refleja el mismo comportamiento que el servidor (toggle/cambio).
    const newVote = userVote === value ? 0 : value;
    setScore((s) => s - userVote + newVote);
    setUserVote(newVote);
    startTransition(async () => {
      await voteSkill(skillId, value);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => vote(1)}
        aria-label="Votar a favor"
        className={cn(
          "rounded-lg border border-border p-1.5 transition-colors hover:bg-muted",
          userVote === 1 && "border-success text-success",
        )}
      >
        <ArrowBigUp className="h-5 w-5" />
      </button>
      <span className="min-w-8 text-center font-semibold">{score}</span>
      <button
        onClick={() => vote(-1)}
        aria-label="Votar en contra"
        className={cn(
          "rounded-lg border border-border p-1.5 transition-colors hover:bg-muted",
          userVote === -1 && "border-destructive text-destructive",
        )}
      >
        <ArrowBigDown className="h-5 w-5" />
      </button>
    </div>
  );
}
