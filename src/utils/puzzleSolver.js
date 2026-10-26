// Sliding Puzzle Logic, Solvability Validator & Solvable Generator

// Calculate inversion count (ignoring blank tile 0)
export const getInversions = (tiles) => {
  let inversions = 0;
  const filtered = tiles.filter((t) => t !== 0);
  for (let i = 0; i < filtered.length - 1; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) {
        inversions++;
      }
    }
  }
  return inversions;
};

// Check if a given configuration of size N x N is mathematically solvable
export const isSolvable = (tiles, size) => {
  const inversions = getInversions(tiles);

  // If width is odd (3x3, 5x5), puzzle is solvable iff inversions is even
  if (size % 2 !== 0) {
    return inversions % 2 === 0;
  }

  // If width is even (4x4):
  // Find row of blank tile from the bottom (1-indexed from bottom)
  const blankIndex = tiles.indexOf(0);
  const blankRowFromTop = Math.floor(blankIndex / size);
  const blankRowFromBottom = size - blankRowFromTop;

  // Solvable if (blank on odd row from bottom AND inversions even) OR (blank on even row from bottom AND inversions odd)
  if (blankRowFromBottom % 2 !== 0) {
    return inversions % 2 === 0;
  } else {
    return inversions % 2 !== 0;
  }
};

// Check if current tiles are in solved state
export const isSolved = (tiles) => {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[tiles.length - 1] === 0;
};

// Generate a guaranteed solvable shuffled board
export const generateSolvablePuzzle = (size = 3) => {
  const total = size * size;
  // Solved state: 1, 2, ..., total-1, 0
  const tiles = Array.from({ length: total }, (_, i) => (i + 1 === total ? 0 : i + 1));

  // Perform random Fisher-Yates shuffle
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (isSolved(tiles) || !isSolvable(tiles, size));

  return tiles;
};

// Check if an index can slide into the blank position
export const canMoveTile = (index, blankIndex, size) => {
  const row = Math.floor(index / size);
  const col = index % size;
  const blankRow = Math.floor(blankIndex / size);
  const blankCol = blankIndex % size;

  // Adjacent horizontally (same row, adjacent col)
  const isHorizontal = row === blankRow && Math.abs(col - blankCol) === 1;
  // Adjacent vertically (same col, adjacent row)
  const isVertical = col === blankCol && Math.abs(row - blankRow) === 1;

  return isHorizontal || isVertical;
};

// Get list of valid adjacent indices that can move into the empty space
export const getMovableIndices = (tiles, size) => {
  const blankIndex = tiles.indexOf(0);
  const movables = [];
  tiles.forEach((_, idx) => {
    if (canMoveTile(idx, blankIndex, size)) {
      movables.push(idx);
    }
  });
  return movables;
};

// Hint generator: Computes Manhattan distance to choose best adjacent tile move
export const getBestHintMove = (tiles, size) => {
  const blankIndex = tiles.indexOf(0);
  const movables = getMovableIndices(tiles, size);
  if (movables.length === 0) return null;

  // Calculate total Manhattan distance for a board state
  const getManhattan = (state) => {
    let distance = 0;
    for (let i = 0; i < state.length; i++) {
      const val = state[i];
      if (val !== 0) {
        const targetRow = Math.floor((val - 1) / size);
        const targetCol = (val - 1) % size;
        const currRow = Math.floor(i / size);
        const currCol = i % size;
        distance += Math.abs(targetRow - currRow) + Math.abs(targetCol - currCol);
      }
    }
    return distance;
  };

  let bestMove = movables[0];
  let minDistance = Infinity;

  for (const moveIdx of movables) {
    const copy = [...tiles];
    // simulate move
    copy[blankIndex] = copy[moveIdx];
    copy[moveIdx] = 0;
    const dist = getManhattan(copy);

    if (dist < minDistance) {
      minDistance = dist;
      bestMove = moveIdx;
    }
  }

  return bestMove;
};
