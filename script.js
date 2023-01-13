// const socket = io("https://tic-tac-toe-hbm6.onrender.com");
const socket = io("http://localhost:5000");
const cross = document.getElementById("cross").cloneNode(true);
const circle = document.getElementById("circle").cloneNode(true);

//function to render the game board
function renderBoard() {
  let board = document.getElementById("board");
  for (let i = 0; i < 3; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < 3; j++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");
      cell.setAttribute("data-row", i);
      cell.setAttribute("data-col", j);
      cell.addEventListener("click", cellClicked);
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}

function cellClicked(event) {
  console.log("cellClicked");
  let row = event.target.getAttribute("data-row");
  let col = event.target.getAttribute("data-col");
  let move = { row: row, col: col, player: socket.id, char: "" };
  socket.emit("player-move", move);
}

socket.on("player-move", function (move) {
  const symbol =
    move.char === "X"
      ? document.getElementById("cross").cloneNode(true)
      : document.getElementById("circle").cloneNode(true);
  let cell = document.querySelector(
    `[data-row="${move.row}"][data-col="${move.col}"]`
  );

  if (!cell.textContent) {
    cell.appendChild(symbol);
    document.getElementById("playerTurn").innerHTML =
      move.player !== socket.id ? "Your turn" : "Opponent's turn";
  }
});

// handle game over event
socket.on("game-over", function (winner) {
  gameOver = true;
  let message = "It's a draw!";
  if (winner !== "draw") {
    message = `Player ${winner} wins!`;
  }
  alert(message);
});

socket.on("player2-connected", function (player2id) {
  renderBoard();
  player1 = socket.id;
  player2 = player2id;
  console.log("player2id", player2id);
  document.getElementById("playerTurn").innerHTML =
    player2id === socket.id ? "Opponent's turn" : "Your turn";
});

socket.on("player-disconnected", function (msg) {
  console.log(msg);
  if (!gameOver) {
    alert("A player disconnected, game will restart.");
    socket.emit("restart-game");
  }
});

socket.on("game-restarted", function (msg) {
  let cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => (cell.textContent = ""));
  player1 = socket.id;
  gameOver = false;
});

document.addEventListener("DOMContentLoaded", function () {
  let gameOver = false;
  console.log("join-gmae");
  socket.emit("join-game");
  document.getElementById("playerTurn").innerHTML = "Your turn";
});
