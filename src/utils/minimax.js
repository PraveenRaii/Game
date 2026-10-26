// Tic-Tac-Toe Minimax Algorithm & Game Logic

export const WINNING_COMBOS = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Col 1
  [1, 4, 7], // Col 2
  [2, 5, 8], // Col 3
  [0, 4, 8], // Diagonal 1
  [2, 4, 6], // Diagonal 2
];

// Check if board has a winner or draw
export const checkWinner = (board) => {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }

  // Draw if all squares are filled
  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', line: null };
  }

  return null;
};

// Get available cell indexes
export const getAvailableMoves = (board) => {
  return board
    .map((val, idx) => (val === null ? idx : null))
    .filter((val) => val !== null);
};

// Easy AI: Selects random move with 30% chance of basic defense
export const getEasyMove = (board, aiSymbol, humanSymbol) => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return null;

  // 40% chance to check for immediate winning move
  if (Math.random() < 0.4) {
    for (const move of available) {
      const copy = [...board];
      copy[move] = aiSymbol;
      if (checkWinner(copy)?.winner === aiSymbol) {
        return move;
      }
    }
  }

  // Random move
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};

// Hard AI: Full Minimax Algorithm (unbeatable)
export const getBestMove = (board, aiSymbol, humanSymbol) => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return null;

  // Opening optimization: if board is empty, pick center or corner
  if (available.length === 9) {
    const openings = [0, 2, 4, 6, 8];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    board[move] = aiSymbol;
    const score = minimax(board, 0, false, aiSymbol, humanSymbol, -Infinity, Infinity);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

// Minimax with Alpha-Beta pruning
const minimax = (board, depth, isMaximizing, aiSymbol, humanSymbol, alpha, beta) => {
  const result = checkWinner(board);
  if (result) {
    if (result.winner === aiSymbol) return 10 - depth;
    if (result.winner === humanSymbol) return depth - 10;
    if (result.winner === 'draw') return 0;
  }

  // Cap depth to prevent runaway processing
  if (depth >= 7) return 0;

  const available = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of available) {
      board[move] = aiSymbol;
      const evaluation = minimax(board, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
      board[move] = null;
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of available) {
      board[move] = humanSymbol;
      const evaluation = minimax(board, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
      board[move] = null;
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};
