// agentScoring — the config-driven scoring engine.
//
// Reproduces the rule that src/data/assessment.ts hard-codes, but reads the
// knobs from the flow document: which steps tally, which step breaks a tie, and
// whether a "modifier" step can pull the result down the level ladder.
//
// Scope note: this is a bounded parameterisation, not a scripting surface. An
// editor can retune the rule; they cannot express a new kind of rule. That is
// deliberate — a scoring change ships with no test gate, so the space of
// reachable behaviours stays small enough to reason about.

import type { RtArchetype, RtFlow } from './agentTypes';

export interface ScoreOutcome {
  /** Archetype the tally alone produced. */
  raw: RtArchetype;
  /** Archetype after the level modifier. Equals `raw` when the rule did not fire. */
  final: RtArchetype;
  /** True when the level modifier fired — the "mindset gap". */
  gap: boolean;
  counts: Record<string, number>;
}

const byLevel = (a: RtArchetype, b: RtArchetype) => a.level - b.level;

function archetypeForLetter(flow: RtFlow, letter: string): RtArchetype | null {
  return flow.archetypes.find((a) => a.letter === letter) ?? null;
}

function archetypeForLevel(flow: RtFlow, level: number): RtArchetype | null {
  return flow.archetypes.find((a) => a.level === level) ?? null;
}

/**
 * Score a completed flow.
 *
 * @param answers letter keyed by step id, e.g. { q1: 'C', q2: 'C', … }
 * @returns null when the answers cannot resolve to an archetype at all
 *          (no tallied answers, or letters that match no archetype).
 */
export function scoreFlow(flow: RtFlow, answers: Record<string, string>): ScoreOutcome | null {
  const tallySteps = flow.steps.filter((s) => s.role === 'tally');
  const counts: Record<string, number> = {};
  for (const a of flow.archetypes) counts[a.letter] = 0;

  for (const step of tallySteps) {
    const letter = answers[step.id];
    if (letter && letter in counts) counts[letter] += 1;
  }

  // Highest count wins; collect ties.
  let maxCount = 0;
  let winners: string[] = [];
  for (const a of [...flow.archetypes].sort(byLevel)) {
    const c = counts[a.letter] ?? 0;
    if (c > maxCount) {
      maxCount = c;
      winners = [a.letter];
    } else if (c === maxCount && c > 0) {
      winners.push(a.letter);
    }
  }
  if (winners.length === 0 || maxCount === 0) return null;

  // Tie-break: the nominated step's own answer wins if it is among the tied
  // letters; otherwise the lowest level does (winners is already level-sorted).
  let rawLetter = winners[0];
  if (winners.length > 1 && flow.scoring.tieBreakStepId) {
    const preferred = answers[flow.scoring.tieBreakStepId];
    if (preferred && winners.includes(preferred)) rawLetter = preferred;
  }

  const raw = archetypeForLetter(flow, rawLetter);
  if (!raw) return null;

  // Level modifier: when a "modifier" step reports a level far enough below the
  // tallied archetype, step the result down the ladder.
  let final = raw;
  let gap = false;
  const modStep = flow.steps.find((s) => s.role === 'modifier');
  const { modifierEnabled, modifierThreshold, modifierDrop } = flow.scoring;

  if (modifierEnabled && modStep) {
    const modLetter = answers[modStep.id];
    const modArchetype = modLetter ? archetypeForLetter(flow, modLetter) : null;
    if (modArchetype && raw.level - modArchetype.level >= modifierThreshold) {
      const floor = Math.min(...flow.archetypes.map((a) => a.level));
      const target = Math.max(floor, raw.level - modifierDrop);
      // Levels are validated unique + contiguous in the Studio, but a bad edit
      // could still leave a hole — fall back to the raw result rather than
      // silently landing on a neighbouring level.
      const dropped = archetypeForLevel(flow, target);
      if (dropped) {
        final = dropped;
        gap = dropped.key !== raw.key;
      }
    }
  }

  return { raw, final, gap, counts };
}
