export const GROUPS = [
  {
    id: "capture",
    title: "Capture",
    description: "Can a later reviewer reconstruct what the source returned?",
    questions: [
      { id: "source_authority", text: "The authoritative source URL and reuse constraints are documented.", weight: 8, blocker: true, action: "Document the authoritative URL, terms, and permitted evidence use before collecting." },
      { id: "raw_capture", text: "The system preserves the raw response or an equivalent lossless source artifact.", weight: 10, blocker: true, action: "Preserve source bytes before transformation, with retrieval time and response metadata." },
      { id: "retrieval_context", text: "Every observation records retrieval time, source identity, and request scope.", weight: 7, action: "Add retrieval time, source identity, and request scope to every sealed observation." },
    ],
  },
  {
    id: "integrity",
    title: "Integrity",
    description: "Do stored values reproduce the seals that claim to protect them?",
    questions: [
      { id: "row_replay", text: "A read-only check rebuilds every row digest from stored values.", weight: 10, blocker: true, action: "Add a read-only full-history row-seal reproduction check." },
      { id: "batch_replay", text: "A run manifest binds the exact set of rows produced by each collection.", weight: 8, action: "Seal each run manifest over the sorted set of inserted row digests." },
      { id: "append_only", text: "Historical observations cannot be silently updated or replaced.", weight: 7, action: "Enforce insert-only history and make corrections additive rather than destructive." },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    description: "Does failure stay visible instead of becoming a confident false fact?",
    questions: [
      { id: "unknown_state", text: "An unreachable or unreadable source reports UNKNOWN, never zero or pass.", weight: 10, blocker: true, action: "Define an explicit UNKNOWN state for network, parse, credential, and sensor failures." },
      { id: "freshness", text: "Freshness is measured against the promised cadence, including missed runs.", weight: 8, action: "Compare newest successful evidence with the source-specific cadence and alert on gaps." },
      { id: "recovery", text: "A stopped scheduler is detected and has a tested recovery procedure.", weight: 7, action: "Monitor both scheduler enabled-state and active-state; test the recovery runbook." },
    ],
  },
  {
    id: "decision",
    title: "Decision",
    description: "Does the evidence reach a named person making a bounded decision?",
    questions: [
      { id: "named_consumer", text: "A named role consumes the output for a specific recurring decision.", weight: 10, blocker: true, action: "Name the consuming role and the exact decision the evidence changes." },
      { id: "decision_artifact", text: "The consumer receives a bounded artifact, not an unread data pile.", weight: 8, action: "Produce a decision-ready report, ledger, alert, or export with explicit scope." },
      { id: "outcome_measure", text: "The system counts human use or business outcomes separately from self-fetches.", weight: 7, action: "Measure qualified human use and outcomes; exclude bots, crawlers, and self-probes." },
    ],
  },
];

export const QUESTIONS = GROUPS.flatMap((group) => group.questions);

export function assess(answers = {}) {
  const possible = QUESTIONS.reduce((sum, question) => sum + question.weight, 0);
  const earned = QUESTIONS.reduce(
    (sum, question) => sum + (answers[question.id] === "yes" ? question.weight : 0),
    0,
  );
  const score = Math.round((earned / possible) * 100);
  const blockers = QUESTIONS
    .filter((question) => question.blocker && answers[question.id] !== "yes")
    .map((question) => question.text);
  const gaps = QUESTIONS
    .filter((question) => answers[question.id] !== "yes")
    .sort((a, b) => Number(b.blocker) - Number(a.blocker) || b.weight - a.weight)
    .map((question) => ({ id: question.id, status: answers[question.id] || "unknown", action: question.action }));
  const unknownCount = QUESTIONS.filter((question) => (answers[question.id] || "unknown") === "unknown").length;

  let level = "At-risk evidence path";
  let explanation = "Critical capture, integrity, failure, or decision controls are not yet proven.";
  if (score >= 85 && blockers.length === 0) {
    level = "Evidence-grade foundation";
    explanation = "The core evidence path is present. Keep testing replay, freshness, and actual human use.";
  } else if (score >= 65 && blockers.length <= 1) {
    level = "Operational, not evidence-grade";
    explanation = "The monitor has useful controls, but at least one gap can still erase or overstate evidence.";
  }

  return { score, level, explanation, blockers, gaps, unknownCount, answeredCount: QUESTIONS.length - unknownCount };
}

export function buildReport(context, answers, result) {
  return {
    schema: "clockproof.assessment.v1",
    generated_at: new Date().toISOString(),
    privacy: "Generated locally in the browser; no assessment data was transmitted by this tool.",
    context,
    answers,
    result,
  };
}
