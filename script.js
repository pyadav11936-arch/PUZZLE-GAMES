
const boardElement = document.getElementById("board");
const movesElement = document.getElementById("moves");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const messageElement = document.getElementById("message");

const shuffleBtn = document.getElementById("shuffleBtn");
const newBtn = document.getElementById("newBtn");

let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
let moves = 0;
let score = 1000;
let best = Number(localStorage.getItem("pyPuzzleBest")) || 0;

function renderBoard() {
  boardElement.innerHTML = "";

  tiles.forEach((number, index) => {
    const tile = document.createElement("button");
    tile.className = number === 0 ? "tile empty" : "tile";
    tile.textContent = number === 0 ? "" : number;

    if (number === 0) {
      tile.disabled = true;
      tile.setAttribute("aria-label", "Empty space");
    } else {
      tile.setAttribute("aria-label", "Tile " + number);
      tile.addEventListener("click", () => moveTile(index));
    }

    boardElement.appendChild(tile);
  });

  movesElement.textContent = moves;
  scoreElement.textContent = score;
  bestElement.textContent = best;
}

function moveTile(index) {
  const emptyIndex = tiles.indexOf(0);

  const row = Math.floor(index / 3);
  const col = index % 3;
  const emptyRow = Math.floor(emptyIndex / 3);
  const emptyCol = emptyIndex % 3;

  const isAdjacent =
    Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

  if (!isAdjacent || isWon()) return;

  [tiles[index], tiles[emptyIndex]] =
    [tiles[emptyIndex], tiles[index]];

  moves++;
  score = Math.max(0, score - 10);

  renderBoard();

  if (isWon()) {
    messageElement.textContent = "🎉 You won! Great job!";
    messageElement.classList.add("win");

    if (best === 0 || moves < best) {
      best = moves;
      localStorage.setItem("pyPuzzleBest", best);
      bestElement.textContent = best;
    }
  } else {
    messageElement.textContent = "Keep going! You can do it.";
    messageElement.classList.remove("win");
  }
}

function isWon() {
  return tiles.every((number, index) => number === index + 1 || (index === 8 && number === 0));
}

function shuffleGame() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  let previousEmpty = -1;

  // Random legal moves keep the puzzle solvable.
  for (let i = 0; i < 150; i++) {
    const emptyIndex = tiles.indexOf(0);
    const neighbors = getNeighbors(emptyIndex)
      .filter(index => index !== previousEmpty);

    const choice =
      neighbors[Math.floor(Math.random() * neighbors.length)];

    [tiles[emptyIndex], tiles[choice]] =
      [tiles[choice], tiles[emptyIndex]];

    previousEmpty = emptyIndex;
  }

  // Avoid starting in the solved state.
  if (isWon()) {
    shuffleGame();
    return;
  }

  moves = 0;
  score = 1000;
  messageElement.textContent = "Tap a tile next to the empty space";
  messageElement.classList.remove("win");
  renderBoard();
}

function getNeighbors(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  const neighbors = [];

  if (row > 0) neighbors.push(index - 3);
  if (row < 2) neighbors.push(index + 3);
  if (col > 0) neighbors.push(index - 1);
  if (col < 2) neighbors.push(index + 1);

  return neighbors;
}

function newGame() {
  shuffleGame();
}

shuffleBtn.addEventListener("click", shuffleGame);
newBtn.addEventListener("click", newGame);

renderBoard();