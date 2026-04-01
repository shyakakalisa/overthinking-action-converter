const thoughtInput = document.getElementById("thoughtInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const summaryText = document.getElementById("summaryText");
const actionsList = document.getElementById("actionsList");
const scoreValue = document.getElementById("scoreValue");
const scoreNote = document.getElementById("scoreNote");
const historyList = document.getElementById("historyList");

let currentResult = null;

function getOverthinkingScore(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const lowerText = text.toLowerCase();
  const triggers = [
    "maybe",
    "what if",
    "but",
    "confused",
    "stuck",
    "overthinking",
    "worry",
    "worried",
    "anxious",
    "stress",
    "problem"
  ];

  let triggerCount = 0;
  triggers.forEach(trigger => {
    const matches = lowerText.match(new RegExp(trigger.replace(" ", "\\s+"), "g"));
    if (matches) triggerCount += matches.length;
  });

  const repeatedWords = {};
  words.forEach(word => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "");
    if (clean.length > 3) {
      repeatedWords[clean] = (repeatedWords[clean] || 0) + 1;
    }
  });

  let repetitionScore = 0;
  Object.values(repeatedWords).forEach(count => {
    if (count > 2) repetitionScore += count;
  });

  let score = Math.min(
    100,
    Math.floor(wordCount * 0.5 + triggerCount * 8 + repetitionScore * 3)
  );

  return score;
}

function createSummary(text) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= 140) {
    return `You seem to be dealing with: ${cleaned}`;
  }
  return `You seem to be dealing with: ${cleaned.slice(0, 140)}...`;
}

function generateActions(text) {
  const lower = text.toLowerCase();

  if (lower.includes("school") || lower.includes("class") || lower.includes("study")) {
    return [
      "Write down the one school task that matters most today.",
      "Spend 25 minutes working on only that task.",
      "Review progress and choose the next small step."
    ];
  }

  if (lower.includes("job") || lower.includes("career") || lower.includes("portfolio")) {
    return [
      "Define one concrete goal for your career this week.",
      "Choose one portfolio task you can finish in under 45 minutes.",
      "Update your progress so you can see momentum."
    ];
  }

  if (lower.includes("money") || lower.includes("finance") || lower.includes("debt")) {
    return [
      "List the top money problem in one sentence.",
      "Choose one financial action for today, such as checking expenses or making a plan.",
      "Set a simple weekly money check-in."
    ];
  }

  if (lower.includes("relationship") || lower.includes("friend") || lower.includes("family")) {
    return [
      "Decide whether this needs a conversation, a boundary, or space.",
      "Write one clear sentence about what you want.",
      "Take one calm action instead of replaying the situation."
    ];
  }

  return [
    "Reduce the problem to one clear sentence.",
    "Pick the smallest useful action you can do today.",
    "Check back after finishing that step before thinking further."
  ];
}

function getScoreNote(score) {
  if (score <= 25) {
    return "Low overthinking: your thoughts seem fairly clear and manageable.";
  }
  if (score <= 55) {
    return "Moderate overthinking: you may be circling the problem a bit.";
  }
  if (score <= 80) {
    return "High overthinking: your mind may be getting stuck in loops.";
  }
  return "Very high overthinking: pause, simplify, and focus on one action only.";
}

function renderResults(result) {
  summaryText.textContent = result.summary;

  actionsList.innerHTML = "";
  result.actions.forEach(action => {
    const li = document.createElement("li");
    li.textContent = action;
    actionsList.appendChild(li);
  });

  scoreValue.textContent = `${result.score} / 100`;
  scoreNote.textContent = result.note;
}

function analyzeThought() {
  const text = thoughtInput.value.trim();

  if (!text) {
    alert("Please type your thoughts first.");
    return;
  }

  const score = getOverthinkingScore(text);
  const summary = createSummary(text);
  const actions = generateActions(text);
  const note = getScoreNote(score);

  currentResult = {
    original: text,
    summary,
    actions,
    score,
    note,
    date: new Date().toLocaleString()
  };

  renderResults(currentResult);
}

function saveEntry() {
  if (!currentResult) {
    alert("Please analyze your thoughts before saving.");
    return;
  }

  const savedEntries = JSON.parse(localStorage.getItem("overthinkingEntries")) || [];
  savedEntries.unshift(currentResult);
  localStorage.setItem("overthinkingEntries", JSON.stringify(savedEntries));

  renderHistory();
}

function renderHistory() {
  const savedEntries = JSON.parse(localStorage.getItem("overthinkingEntries")) || [];

  if (savedEntries.length === 0) {
    historyList.innerHTML = `<p class="placeholder">No saved entries yet.</p>`;
    return;
  }

  historyList.innerHTML = "";

  savedEntries.forEach(entry => {
    const item = document.createElement("div");
    item.className = "history-item";

    const actionsHtml = entry.actions.map(action => `<li>${action}</li>`).join("");

    item.innerHTML = `
      <h3>${entry.score} / 100</h3>
      <p><strong>Summary:</strong> ${entry.summary}</p>
      <ul>${actionsHtml}</ul>
      <p class="meta">Saved: ${entry.date}</p>
    `;

    historyList.appendChild(item);
  });
}

function clearInput() {
  thoughtInput.value = "";
  currentResult = null;

  summaryText.textContent = "Your summary will appear here.";
  actionsList.innerHTML = "<li>Action steps will appear here.</li>";
  scoreValue.textContent = "0 / 100";
  scoreNote.textContent = "Write something above to calculate your score.";
}

function clearHistory() {
  localStorage.removeItem("overthinkingEntries");
  renderHistory();
}

analyzeBtn.addEventListener("click", analyzeThought);
clearBtn.addEventListener("click", clearInput);
saveBtn.addEventListener("click", saveEntry);
clearHistoryBtn.addEventListener("click", clearHistory);

renderHistory();
