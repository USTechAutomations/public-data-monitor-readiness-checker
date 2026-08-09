import { GROUPS, QUESTIONS, assess, buildReport } from "./scoring.mjs";

const form = document.querySelector("#readiness-form");
const groupsRoot = document.querySelector("#question-groups");
const results = document.querySelector("#results");
let latestReport = null;

function choice(questionId, value, label) {
  return `<label class="choice"><input type="radio" name="${questionId}" value="${value}"><span>${label}</span></label>`;
}

groupsRoot.innerHTML = GROUPS.map((group) => `
  <fieldset class="question-group">
    <legend><h3>${group.title}</h3></legend>
    <p class="group-description">${group.description}</p>
    ${group.questions.map((question) => `
      <div class="question">
        <p>${question.text}</p>
        <div class="choices" role="radiogroup" aria-label="${question.text}">
          ${choice(question.id, "yes", "Yes")}
          ${choice(question.id, "no", "No")}
          ${choice(question.id, "unknown", "Unknown")}
        </div>
      </div>
    `).join("")}
  </fieldset>
`).join("");

function collectAnswers() {
  return Object.fromEntries(QUESTIONS.map((question) => {
    const selected = form.querySelector(`input[name="${question.id}"]:checked`);
    return [question.id, selected?.value || "unknown"];
  }));
}

function collectContext() {
  return {
    monitor_name: form.elements.monitorName.value.trim() || "Unnamed monitor",
    decision: form.elements.decision.value.trim() || "Not provided",
    cadence: form.elements.cadence.value || "Unknown",
    backfill: form.elements.backfill.value || "unknown",
  };
}

function render(result) {
  document.querySelector("#score").textContent = result.score;
  document.querySelector(".score-ring").style.setProperty("--score-angle", `${result.score * 3.6}deg`);
  document.querySelector("#result-level").textContent = result.level;
  document.querySelector("#result-explanation").textContent = `${result.explanation} ${result.unknownCount} of ${QUESTIONS.length} controls remain unknown.`;

  const blockerRoot = document.querySelector("#blockers");
  blockerRoot.innerHTML = result.blockers.length
    ? result.blockers.map((item) => `<li>${item}</li>`).join("")
    : "<li>No core blocker was reported. Validate the answers with a read-only replay test.</li>";

  const actionRoot = document.querySelector("#actions");
  actionRoot.innerHTML = result.gaps.length
    ? result.gaps.slice(0, 5).map((gap) => `<li>${gap.action} <small>(${gap.status})</small></li>`).join("")
    : "<li>Schedule a recurring full-history replay and review human-use evidence.</li>";

  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const answers = collectAnswers();
  const context = collectContext();
  const result = assess(answers);
  latestReport = buildReport(context, answers, result);
  render(result);
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    results.hidden = true;
    latestReport = null;
    document.querySelector("#copy-status").textContent = "";
  }, 0);
});

document.querySelector("#download-report").addEventListener("click", () => {
  if (!latestReport) return;
  const blob = new Blob([`${JSON.stringify(latestReport, null, 2)}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "clockproof-assessment.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelector("#copy-summary").addEventListener("click", async () => {
  if (!latestReport) return;
  const { context, result } = latestReport;
  const text = [
    `Clockproof assessment: ${context.monitor_name}`,
    `${result.score}/100 — ${result.level}`,
    `Core blockers: ${result.blockers.length}`,
    `Unknown controls: ${result.unknownCount}`,
    ...result.gaps.slice(0, 3).map((gap, index) => `${index + 1}. ${gap.action}`),
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    document.querySelector("#copy-status").textContent = "Summary copied.";
  } catch {
    document.querySelector("#copy-status").textContent = "Clipboard unavailable; download the report instead.";
  }
});
