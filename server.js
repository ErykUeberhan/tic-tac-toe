const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const http = require("http").Server(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });
const PORT = process.env.PORT || 5000;

let board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];
let currentPlayer = "X";
let turn = null;
let gameOver = false;
let player1 = null;
let player2 = null;
let isGameReady = false;

function restart() {
  board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  currentPlayer = "X";
  gameOver = false;
  io.emit("game-restarted", "game restarted");
}

// function to check for winner
function checkForWinner() {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] === board[i][1] &&
      board[i][1] === board[i][2] &&
      board[i][0] !== ""
    ) {
      return board[i][0];
    }
  }
  // Check columns
  for (let i = 0; i < 3; i++) {
    if (
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i] &&
      board[0][i] !== ""
    ) {
      return board[0][i];
    }
  }
  // Check diagonals
  if (
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2] &&
    board[0][0] !== ""
  ) {
    return board[0][0];
  }
  if (
    board[0][2] === board[1][1] &&
    board[1][1] === board[2][0] &&
    board[0][2] !== ""
  ) {
    return board[0][2];
  }
  // Check for draw
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === "") {
        return null;
      }
    }
  }
  return "draw";
}

io.on("connection", function (socket) {
  socket.on("join-game", function () {
    if (!player1) {
      console.log("player1 joined to game");
      player1 = socket;
      turn = player1.id;
    } else {
      console.log("player2 joined to game");
      player2 = socket;
      isGameReady = true;
      io.emit("player2-connected", player2.id);
    }
  });

  socket.on("disconnect", function () {
    if (socket === player1) {
      player1 = null;
    } else if (socket === player2) {
      player2 = null;
    }
    restart();
    io.emit("player-disconnected", "A player disconnected");
  });

  socket.on("player-move", function (move) {
    if (!isGameReady) {
      return;
    }

    if (move.row === null || move.col === null) return;
    if (move.player === turn && !board[move.row][move.col]) {
      turn = move.player === player1.id ? player2.id : player1.id;
      board[move.row][move.col] = move.player === player1.id ? "X" : "O";
      let winner = checkForWinner();
      if (winner) {
        move.char = move.player === player1.id ? "X" : "O";
        io.emit("player-move", move);
        io.emit("game-over", winner);
        gameOver = true;
        currentPlayer = null;
        restart();
      } else {
        move.char = move.player === player1.id ? "X" : "O";
        io.emit("player-move", move);
      }
    }
  });

  socket.on("restart-game", function () {
    board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    currentPlayer = "X";
    gameOver = false;
    io.emit("game-restarted", "game restarted");
  });
});

http.listen(PORT, function () {
  console.log("Server running on port " + PORT);
});

app.get("/", function (req, res) {
  res.send("Server is running");
});
