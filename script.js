
const board = document.getElementById("board");
const movesDisplay = document.getElementById("moves");
const scoreDisplay = document.getElementById("score");
const bestDisplay = document.getElementById("bestScore");
const timeDisplay = document.getElementById("time");
const yourScoreDisplay = document.getElementById("yourScore");
const message = document.getElementById("message");
const leaderboard = document.getElementById("leaderboard");

const shuffleBtn = document.getElementById("shuffleBtn");
const resetBtn = document.getElementById("resetBtn");
const scoresBtn = document.getElementById("scoresBtn");

const solvedBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];

let tiles = [...solvedBoard];
let moves = 0;
let score = 800;
let seconds = 0;
let timer = null;
let gameStarted = false;
let gameFinished = false;

let bestScore = Number(
  localStorage.getItem("pzBestScore")
) || 0;

let savedScores = JSON.parse(
  localStorage.getItem("pzLeaderboard") || "[]"
);

// Demo players shown in the example design
const samplePlayers = [
  { name: "Player 2", score: 320 },
  { name: "Player 3", score: 280 },
  { name: "Player 4", score: 240 },
  { name: "Player 5", score: 200 }
];

// TIME FORMAT
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return String(minutes).padStart(2, "0") +
    ":" + String(secs).padStart(2, "0");
}

// UPDATE SCORE AND TIME
function updateStats() {
  movesDisplay.textContent = moves;
  scoreDisplay.textContent = score;
  bestDisplay.textContent = bestScore;
  yourScoreDisplay.textContent = score;
  timeDisplay.textContent = formatTime(seconds);
}

// TIMER
function startTimer() {
  if (timer !== null) return;

  timer = setInterval(() => {
    seconds++;
    timeDisplay.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

// DRAW PUZZLE
function renderBoard() {
  board.innerHTML = "";

  tiles.forEach((number, index) => {
    const tile = document.createElement("button");

    tile.className = number === 0 ? "tile empty" : "tile";
    tile.textContent = number === 0 ? "" : number;

    if (number === 0) {
      tile.disabled = true;
      tile.setAttribute("aria-label", "Empty space");
    } else {
      tile.setAttribute("aria-label", "Tile " + number);

      tile.addEventListener("click", () => {
        moveTile(index);
      });
    }

    board.appendChild(tile);
  });

  updateStats();
}

// FIND NEIGHBOURING CELLS
function getNeighbors(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  const result = [];

  if (row > 0) result.push(index - 3);
  if (row < 2) result.push(index + 3);
  if (col > 0) result.push(index - 1);
  if (col < 2) result.push(index + 1);

  return result;
}

// CHECK WIN
function isWon() {
  return tiles.every((number, index) => {
    return number === (index === 8 ? 0 : index + 1);
  });
}

// MOVE TILE
function moveTile(index) {
  if (gameFinished) return;

  const emptyIndex = tiles.indexOf(0);
  const neighbors = getNeighbors(emptyIndex);

  if (!neighbors.includes(index)) {
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  [tiles[index], tiles[emptyIndex]] =
    [tiles[emptyIndex], tiles[index]];

  moves++;
  score = Math.max(0, 800 - moves * 50);

  message.classList.remove("win");
  message.textContent =
    "Keep going! Arrange 1 to 8 to win.";

  renderBoard();

  if (isWon()) {
    finishGame();
  }
}

// FINISH GAME
function finishGame() {
  gameFinished = true;
  stopTimer();

  message.textContent =
    "🏆 Great Job, Priyanshu! You solved the puzzle!";
  message.classList.add("win");

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("pzBestScore", bestScore);
  }

  saveResult();
  renderLeaderboard();
  updateStats();
}

// SAVE RESULT
function saveResult() {
  if (score <= 0) return;

  savedScores.push({
    name: "Priyanshu",
    score: score,
    moves: moves,
    time: seconds
  });

  savedScores.sort((a, b) => b.score - a.score);
  savedScores = savedScores.slice(0, 10);

  localStorage.setItem(
    "pzLeaderboard",
    JSON.stringify(savedScores)
  );
}

// DRAW HIGH SCORES
function renderLeaderboard() {
  leaderboard.innerHTML = "";

  const myScores = savedScores
    .filter(player => player.name === "Priyanshu")
    .map(player => player.score);

  const myBest = Math.max(bestScore, ...myScores);

  const allPlayers = [
    {
      name: "Priyanshu",
      score: myBest,
      current: true
    },
    ...samplePlayers
  ];

  allPlayers.sort((a, b) => b.score - a.score);

  allPlayers.slice(0, 5).forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "score-row";

    if (player.current) {
      row.classList.add("current");
    }

    const rank = document.createElement("span");
    rank.className = "rank";
    rank.textContent = index + 1;

    const name = document.createElement("span");
    name.className = "player-name";
    name.textContent = player.name;

    const points = document.createElement("strong");
    points.className = "player-points";
    points.textContent = player.score;

    row.append(rank, name, points);
    leaderboard.appendChild(row);
  });
}

// RESET GAME TO SOLVED BOARD
function resetGame() {
  stopTimer();

  tiles = [...solvedBoard];
  moves = 0;
  score = 800;
  seconds = 0;
  gameStarted = false;
  gameFinished = false;

  message.textContent =
    "Click a number next to the empty space to move it.";
  message.classList.remove("win");

  renderBoard();
}

// SHUFFLE INTO A SOLVABLE BOARD
function shuffleGame() {
  stopTimer();

  let shuffled = [...solvedBoard];
  let previousEmpty = -1;

  // Make many legal moves so the puzzle stays solvable.
  for (let i = 0; i < 150; i++) {
    const emptyIndex = shuffled.indexOf(0);

    const choices = getNeighbors(emptyIndex)
      .filter(index => index !== previousEmpty);

    const choice =
      choices[Math.floor(Math.random() * choices.length)];

    [shuffled[emptyIndex], shuffled[choice]] =
      [shuffled[choice], shuffled[emptyIndex]];

    previousEmpty = emptyIndex;
  }

  // If it happens to be solved, shuffle again.
  while (shuffled.every((number, index) =>
    number === (index === 8 ? 0 : index + 1)
  )) {
    shuffled = [...solvedBoard];
    previousEmpty = -1;

    for (let i = 0; i < 150; i++) {
      const emptyIndex = shuffled.indexOf(0);

      const choices = getNeighbors(emptyIndex)
        .filter(index => index !== previousEmpty);

      const choice =
        choices[Math.floor(Math.random() * choices.length)];

      [shuffled[emptyIndex], shuffled[choice]] =
        [shuffled[choice], shuffled[emptyIndex]];

      previousEmpty = emptyIndex;
    }
  }

  tiles = shuffled;
  moves = 0;
  score = 800;
  seconds = 0;
  gameStarted = false;
  gameFinished = false;

  message.textContent =
    "New puzzle! Click a tile next to the empty space.";
  message.classList.remove("win");

  renderBoard();
}

// BUTTONS
shuffleBtn.addEventListener("click", shuffleGame);
resetBtn.addEventListener("click", resetGame);

scoresBtn.addEventListener("click", () => {
  document.getElementById("highScores").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  message.textContent = "Here are the high scores!";
});

// INITIAL DISPLAY
renderBoard();
renderLeaderboard();