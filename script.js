const container = document.createElement("div");
const gameArea = document.createElement("main");
const header = document.createElement("header");
const turnCounterContainer = document.createElement("div");
const turnCounterTitle = document.createElement("span");
const turnCounter = document.createElement("span");
const flagCounterContainer = document.createElement("div");
const flagCounterTitle = document.createElement("span");
const flagCounter = document.createElement("span");
const bombsWord = document.createElement("span");
const restartBtn = document.createElement("button");
const timerContainer = document.createElement("div");
const timerTitle = document.createElement("span");
const timer = document.createElement("span");
const difSection = document.createElement("section");
const ezDif = document.createElement("button");
const normDif = document.createElement("button");
const hardDif = document.createElement("button");
const openScore = document.createElement("button");
const themeBtn = document.createElement("button");
const bombsInput = document.createElement("input");
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const canvasBlocker = document.createElement("div");
const scoreboard = document.createElement("table");
const scoreContainer = document.createElement("section");
const currWords = document.createElement("span");

const bomb = new Image();
const flag = new Image();
const clickSound = new Audio();
const explosionSound = new Audio();
const flagSound = new Audio();
const winSound = new Audio();
const loseSound = new Audio();

const assetsDefinitions = () => {
  bomb.src = "./images/mine.png";
  flag.src = "./images/flag.png";
  clickSound.src = "./audio/click.mp3";
  explosionSound.src = "./audio/explosion.mp3";
  flagSound.src = "./audio/tick.mp3";
  winSound.src = "./audio/winSound.mp3";
  loseSound.src = "./audio/lose.mp3";
};

assetsDefinitions();

class GameInfo {
  constructor(area, bombs, turns, time, flags) {
    this.area = area;
    this.bomb = bombs;
    this.turns = turns;
    this.time = time;
    this.flags = flags;
  }
}

restartBtn.innerText = "Restart";
bombsWord.innerText = "Bombs:";
ezDif.innerText = "Easy";
normDif.innerText = "Normal";
hardDif.innerText = "Hard";
openScore.innerText = "Score";
themeBtn.innerText = "Theme";
turnCounterTitle.innerText = "T";
flagCounterTitle.innerText = "F";
timerTitle.innerText = "Time";
bombsInput.setAttribute("type", "text");

const addCssClasses = () => {
  container.classList.add("container");
  gameArea.classList.add("main");
  header.classList.add("header");
  turnCounterContainer.classList.add("header__turn-counter");
  flagCounterContainer.classList.add("header__flag-counter");
  restartBtn.classList.add("header__restart-btn");
  timerContainer.classList.add("header__timer");
  canvas.classList.add("canvas");
  canvasBlocker.classList.add("canvas-blocker");
  difSection.classList.add("dif-section");
  ezDif.classList.add("header__dif");
  ezDif.id = "ez";
  normDif.classList.add("header__dif");
  normDif.id = "norm";
  hardDif.classList.add("header__dif");
  hardDif.id = "hard";
  scoreContainer.classList.add("score-container");
  openScore.classList.add("header__dif");
  openScore.id = "openScore";

  bombsWord.classList.add("header__bombs-word");
  bombsInput.classList.add("header__input");
  scoreboard.classList.add("scoreboard");

  [restartBtn, ezDif, normDif, hardDif, openScore, themeBtn].forEach((item) => {
    item.classList.add("btn");
  });
};
addCssClasses();

const appendHtml = () => {
  document.body.appendChild(container);
  container.appendChild(difSection);
  container.appendChild(gameArea);
  container.appendChild(scoreContainer);
  scoreContainer.appendChild(scoreboard);
  gameArea.appendChild(header);
  gameArea.appendChild(canvas);
  gameArea.appendChild(canvasBlocker);
  header.appendChild(turnCounterContainer);
  turnCounterContainer.appendChild(turnCounterTitle);
  turnCounterContainer.appendChild(turnCounter);
  header.appendChild(flagCounterContainer);
  flagCounterContainer.appendChild(flagCounterTitle);
  flagCounterContainer.appendChild(flagCounter);
  header.appendChild(restartBtn);
  header.appendChild(timerContainer);
  timerContainer.appendChild(timerTitle);
  timerContainer.appendChild(timer);
  header.appendChild(bombsWord);
  header.appendChild(bombsInput);
  difSection.appendChild(ezDif);
  difSection.appendChild(normDif);
  difSection.appendChild(hardDif);
  difSection.appendChild(openScore);
  difSection.appendChild(themeBtn);
};
appendHtml();

canvasBlocker.style = `height: 0; width: 0;`;

let area = 10;
let cellSize = canvas.width / area;
let cellsAmount = (canvas.width / cellSize) * (canvas.height / cellSize);
let grid = [];

let interval;
let turnCount = 0;
turnCounter.innerText = turnCount;

let time = 0;
timer.innerText = time;

let isGameOver = false;

let flaggedCells = 0;
flagCounter.innerText = flaggedCells;

let bombsAmount = 10;
bombsInput.value = 10;
function setBombsInput() {
  bombsAmount = bombsInput.value;
}
setBombsInput();
bombsInput.addEventListener("change", () => {
  if (bombsInput.value > 9 && bombsInput.value < 100) {
    setBombsInput();
    restartGame();
  } else {
    alert("Wrong bombs amount. Please choose a number between 9 and 100");
    bombsInput.value = 33;
    setBombsInput();
    restartGame();
  }
});

difSection.addEventListener("click", (e) => {
  if (e.target.classList.contains("header__dif")) {
    if (e.target.id === "ez") {
      area = 10;
    } else if (e.target.id === "norm") {
      area = 15;
    } else if (e.target.id === "hard") {
      area = 25;
    }
    changeCanvasSize();
    restartGame();
  }
  if (e.target.id === "openScore") {
    scoreContainer.classList.add("active");
  }
});

scoreContainer.addEventListener("click", () => {
  scoreContainer.classList.remove("active");
});

themeBtn.addEventListener("click", () => {
  container.classList.toggle("dark");
});

function createGrid() {
  grid = [];
  for (let row = 0; row < area; row++) {
    grid[row] = [];

    for (let col = 0; col < area; col++) {
      grid[row][col] = {
        x: row * cellSize,
        y: col * cellSize,
        hasBomb: false,
        hasFlag: false,
        isRevealed: false,
        neighborCount: 0,
      };
    }
  }

  let bombsPlaced = 0;
  while (bombsPlaced < bombsAmount) {
    const randomRow = Math.floor(Math.random() * area);
    const randomCol = Math.floor(Math.random() * area);
    const cell = grid[randomRow][randomCol];

    if (!cell.hasBomb) {
      cell.hasBomb = true;
      bombsPlaced++;
    }
  }
}

createGrid();

function drawGrid() {
  context.beginPath();

  for (let row = 0; row < area; row++) {
    for (let col = 0; col < area; col++) {
      const cell = grid[row][col];
      cell.neighborCount = getNeighborCount(row, col);
      context.rect(cell.x, cell.y, cellSize, cellSize);
      context.fillStyle = "grey";
      context.fill();
    }
  }

  context.strokeStyle = "#999";
  context.stroke();
}
drawGrid();

function drawCell(cell) {
  const posX = cell.x + cellSize * 0.45;
  const posY = cell.y + cellSize * 0.6;
  context.stroke();
  if (!cell.isRevealed) {
    context.fillStyle = "red";
    context.fillRect(cell.x, cell.y, cellSize, cellSize);
  } else {
    if (cell.hasBomb) {
      context.fillStyle = "red";
      context.fillRect(cell.x, cell.y, cellSize, cellSize);
      context.drawImage(bomb, cell.x, cell.y, cellSize, cellSize);
    } else {
      context.fillStyle = "#fff";
      context.font = "14px Arial";
      context.fillRect(cell.x, cell.y, cellSize, cellSize);

      switch (cell.neighborCount) {
        case 0:
          break;
        case 1:
          context.fillStyle = "green";

          break;
        case 2:
          context.fillStyle = "yellowgreen";

          break;
        case 3:
          context.fillStyle = "orange";

          break;
        case 4:
          context.fillStyle = "red";

          break;
        default:
          context.fillStyle = "brown";

          break;
      }
      context.fillText(cell.neighborCount, posX, posY);
    }
  }
}

function drawFlag(cell) {
  if (!cell.isRevealed) {
    cell.hasFlag = !cell.hasFlag;
    if (cell.hasFlag) {
      context.drawImage(flag, cell.x, cell.y, cellSize, cellSize);
    } else {
      context.fillStyle = "grey";
      context.fillRect(cell.x, cell.y, cellSize, cellSize);
      context.stroke();
    }
    flagCouter();
  }
}

function flagCouter() {
  flaggedCells = grid.flat().filter((item) => item.hasFlag).length;
  flagCounter.innerText = flaggedCells;
}

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const cellX = Math.floor(event.offsetX / cellSize);
  const cellY = Math.floor(event.offsetY / cellSize);
  const cell = grid[cellX][cellY];
  drawFlag(cell);
  flagSound.play();
});

canvas.addEventListener("click", (event) => {
  const cellX = Math.floor(event.offsetX / cellSize);
  const cellY = Math.floor(event.offsetY / cellSize);
  const cell = grid[cellX][cellY];
  saveSettings();

  if (turnCount === 0 && !interval) timeCounter();
  if (!cell.isRevealed) {
    clickSound.play();
    turnCount++;
    turnCounter.innerText = turnCount;
  }
  cell.isRevealed = true;
  if (cell.hasBomb) {
    if (turnCount === 1) {
      cell.hasBomb = false;
      for (let i = -2; i < 2 && i !== 0; i++) {
        grid[cellX + i][cellY + i].hasBomb === false
          ? (grid[cellX + i][cellY + i].hasBomb = true)
          : "";
      }
    } else {
      gameOver();
    }
  } else {
    checkWin();

    if (cell.neighborCount === 0) {
      drawEmptyCell(cellX, cellY);
    }
  }
  localStorage.removeItem("grid");
  localStorage.setItem("grid", JSON.stringify(grid));
  drawCell(cell);
});

function getNeighborCount(row, col) {
  let count = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      const r = row + x;
      const c = col + y;

      if (r > -1 && r < area && c > -1 && c < area) {
        const neighbor = grid[r][c];

        if (neighbor.hasBomb) {
          count++;
        }
      }
    }
  }
  return count;
}

function drawEmptyCell(cellX, cellY) {
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      const r = cellX + x;
      const c = cellY + y;

      if (r > -1 && r < area && c > -1 && c < area) {
        const neighbor = grid[r][c];

        if (!neighbor.isRevealed) {
          neighbor.isRevealed = true;

          if (neighbor.neighborCount === 0 && !neighbor.hasBomb) {
            neighbor.isRevealed = true;
            drawCell(neighbor);
            drawEmptyCell(r, c);
          } else if (neighbor.neighborCount > 0) {
            drawCell(neighbor);
          } else {
            if (r === 0 || r === area - 1 || c === 0 || c === area - 1) {
              drawCell(neighbor);

              drawEmptyCell(r, c);
            }
          }
        }
      }
    }
  }
  localStorage.setItem("grid", JSON.stringify(grid));
}

function timeCounter() {
  interval = setInterval(() => {
    time++;
    timer.innerText = time;
    saveSettings();
  }, 1000);
}

function checkWin() {
  const revealedCellsCounter = grid
    .flat()
    .filter((item) => item.isRevealed).length;
  const clearCellsAmount = cellsAmount - bombsAmount;
  if (revealedCellsCounter >= clearCellsAmount) {
    setTimeout(() => {
      header.removeChild(currWords);
    }, 2800);
    drawEndWords("You win");
    changeGameAreaSize(canvas.width, true);
    winSound.play();
    clearInterval(interval);
    saveScore(new GameInfo(area, bombsAmount, turnCount, time, flaggedCells));
  }
}

function restartGame() {
  clearInterval(interval);
  interval = false;
  turnCount = 0;
  turnCounter.innerText = turnCount;
  time = 0;
  timer.innerText = time;
  isGameOver = false;
  flaggedCells = 0;
  createGrid();
  drawGrid();
  changeGameAreaSize(canvas.width, false);
}

function gameOver() {
  const allMines = grid.flat().filter((item) => item.hasBomb);
  allMines.forEach((item) => {
    item.isRevealed = true;
    drawCell(item);
  });

  changeGameAreaSize(canvas.width, true);
  setTimeout(() => {
    explosionSound.play();
    header.removeChild(currWords);
  }, 3100);
  drawEndWords("You loose!");
  loseSound.play();
  clearInterval(interval);
}

restartBtn.addEventListener("click", () => {
  changeCanvasSize();
  restartGame();
});

function changeCanvasSize() {
  if (window.innerWidth < 768) {
    canvas.width = canvas.height = window.innerWidth / 1.25;
  } else {
    canvas.width = canvas.height = Math.min(
      window.innerWidth / 3,
      window.innerHeight / 1.5
    );
  }
  cellSize = canvas.width / area;
  cellsAmount = area * area;
}

changeCanvasSize();
restartGame();

function changeGameAreaSize(size, isBlock) {
  gameArea.style = `height: ${size + 100}px; width: ${size}px;`;
  header.style = `width: ${size}px; `;
  isBlock
    ? (canvasBlocker.style = `height: ${size}px; width: ${size}px;`)
    : (canvasBlocker.style = `height: 0; width: 0;`);
}

function drawEndWords(words) {
  header.appendChild(currWords);
  currWords.innerText = words;
  currWords.classList.add("end-words");
}

const loadProgress = () => {
  if (localStorage.getItem("grid")) {
    grid = [];
    grid = JSON.parse(localStorage.getItem("grid"));
    const settings = JSON.parse(localStorage.getItem("settings"));
    area = settings.area;
    bombsAmount = settings.bomb;
    turnCount = settings.turns;
    time = settings.time;
    turnCounter.innerText = turnCount;
    timer.innerText = time;
    bombsInput.value = bombsAmount;
    if (settings.flaggedCells) {
      flaggedCells = settings.flags;
      flagCounter.innerText = flaggedCells;
    }

    changeCanvasSize();
    timeCounter();
    drawGrid();

    const revealedCellsCounter = grid
      .flat()
      .filter((item) => item.isRevealed).length;
    const clearCellsAmount = cellsAmount - bombsAmount;
    if (revealedCellsCounter >= clearCellsAmount) {
      changeGameAreaSize(canvas.width, true);
    }

    changeGameAreaSize(canvas.width, false);
    grid.flat().forEach((item) => {
      if (item.isRevealed) {
        drawCell(item);
      }
    });
  }
};

loadProgress();

function saveScore(currScore) {
  if (localStorage.getItem("score")) {
    let score = JSON.parse(localStorage.getItem("score"));
    if (score.length > 9) {
      score.splice(0, 1);
      score.push(currScore);
      localStorage.setItem("score", JSON.stringify(score));
    } else {
      score.push(currScore);
      localStorage.setItem("score", JSON.stringify(score));
    }
  } else {
    let arr = [];
    arr.push(currScore);
    localStorage.setItem("score", JSON.stringify(arr));
  }
}

function writeScore() {
  let counter = 0;
  scoreboard.innerHTML = `<caption>Scoreboard (click to close) </caption>
   <tr><td>Number</td><td>Area</td><td>Bombs</td><td>Turns</td><td>Time</td>
   </tr>
   `;
  if (localStorage.getItem("score")) {
    JSON.parse(localStorage.getItem("score")).forEach((score) => {
      counter++;
      scoreboard.innerHTML += `<tr><td>${counter}</td><td>${score.area}</td><td>${score.bomb}</td><td>${score.turns}</td><td>${score.time}</td></tr>`;
    });
  }
}

writeScore();

function saveSettings() {
  const currSettings = new GameInfo(
    area,
    bombsAmount,
    turnCount,
    time,
    flaggedCells
  );
  localStorage.setItem("settings", JSON.stringify(currSettings));
}

window.addEventListener("resize", () => {
  changeCanvasSize();
  changeGameAreaSize(canvas.width, false);
  restartGame();
});
