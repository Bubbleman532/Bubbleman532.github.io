// These answers are the same for every daily image.
const correctAnswers = ["Hai", "WhatTheHai", "Hai Goodbye", "Hai Ghudbye", "WhatTheHaiTV", "SDVX", "HaiGoodbye", "HaiGhudbye", "HaiGhudbai", "Hai Ghudbai", "jackylam", "jackylam5"];

// The first WhatTheHaidle puzzle is 29 August 2026. The same date always
// selects the same image, while a new date selects the next one.
const firstGameDate = new Date(2026, 7, 29);
const zoomLevels = [90, 40, 20, 10, 4, 1];
const image = document.querySelector("#mystery-image");
const imageFrame = document.querySelector("#image-frame");
const form = document.querySelector("#guess-form");
const input = document.querySelector("#guess-input");
const message = document.querySelector("#message");
const guessList = document.querySelector("#guess-list");
const attemptNumber = document.querySelector("#attempt-number");
const revealLabel = document.querySelector("#reveal-label");
const steps = [...document.querySelectorAll(".progress span")];
const shareDialog = document.querySelector("#share-dialog");
const shareGrid = document.querySelector("#share-grid");
const shareSummary = document.querySelector("#share-summary");
const shareButton = document.querySelector("#share-button");
const copyNote = document.querySelector("#copy-note");

function dailyPuzzleIndex() {
  const today = new Date();
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysSinceFirstGame = Math.max(0, Math.floor((todayAtMidnight - firstGameDate) / millisecondsPerDay));
  return daysSinceFirstGame + 1;
}

const puzzle = { image: `images/day${dailyPuzzleIndex()}.jpg` };

let guesses = 0;
let finished = false;
let resultTiles = [];

function normalise(value) {
  return value.toLowerCase().trim().replace(/[^a-z ]/g, "").replace(/\s+/g, " ");
}

function loadPuzzle() {
  guesses = 0;
  finished = false;
  resultTiles = [];
  image.src = puzzle.image;
  image.style.transform = `scale(${zoomLevels[0]})`;
  imageFrame.setAttribute("aria-label", "A heavily zoomed-in mystery image");
  guessList.innerHTML = "";
  message.className = "message";
  message.textContent = "";
  input.value = "";
  input.disabled = false;
  form.querySelector("button").disabled = false;
  refreshReveal();
  input.focus();
}

function refreshReveal() {
  attemptNumber.textContent = Math.min(guesses + 1, 6);
  revealLabel.textContent = `Reveal ${Math.min(guesses + 1, 6)} of 6`;
  steps.forEach((step, index) => step.classList.toggle("active", index <= guesses));
}

function addGuess(value, right) {
  const tag = document.createElement("span");
  tag.className = `guess-tag ${right ? "right" : "wrong"}`;
  tag.textContent = value;
  guessList.append(tag);
}

function dateLabel() {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date());
}

function resultText() {
  const tiles = Array.from({ length: 6 }, (_, index) => {
    if (index >= resultTiles.length) return "⬛";
    return resultTiles[index] ? "🟩" : "🟥";
  });
  return `WhatTheHaidle - ${dateLabel()}\n${tiles.join("")}`;
}

function openShareDialog(won) {
  shareGrid.textContent = resultText();
  shareSummary.textContent = won ? `Solved in ${resultTiles.length} of 6 guesses` : "It was WhatTheHai! Better luck next time.";
  copyNote.textContent = "";
  shareDialog.showModal();
}

function endGame(won) {
  finished = true;
  input.disabled = true;
  form.querySelector("button").disabled = true;
  image.style.transform = "scale(1)";
  imageFrame.setAttribute("aria-label", "The daily mystery image is fully revealed");
  document.querySelector(".image-vignette").style.opacity = "0";
  revealLabel.textContent = won ? "You got it!" : "Out of guesses";
  message.className = `message ${won ? "success" : "failure"}`;
  message.textContent = won ? "" : "Out of guesses.";
  window.setTimeout(() => openShareDialog(won), 2000);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (finished) return;
  const guess = normalise(input.value);
  if (!guess) return;
  const right = correctAnswers.some((answer) => normalise(answer) === guess);
  addGuess(input.value.trim(), right);
  resultTiles.push(right);
  input.value = "";

  if (right) return endGame(true);
  guesses += 1;
  if (guesses >= 6) return endGame(false);

  image.style.transform = `scale(${zoomLevels[guesses]})`;
  refreshReveal();
  input.focus();
});

shareButton.addEventListener("click", async () => {
  let text = resultText();
  try {
    await navigator.clipboard.writeText(text + "\nhttps://whatthehaidle.com");
    copyNote.textContent = "Result copied to your clipboard.";
  } catch (err) {
    copyNote.textContent = "Failed to copy: ", err;
  }
});

loadPuzzle();
