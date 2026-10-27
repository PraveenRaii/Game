// Client-side Multiplayer Service with Backend API + Local Broadcast Fallback

const API_BASE = '/api/rooms';

// BroadcastChannel for instant local cross-tab sync when testing on same device/browser
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('gamezone_multiplayer_channel')
  : null;

// Local fallback store for offline testing
const LOCAL_ROOMS_KEY = 'gamezone_local_rooms';

function getLocalRooms() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ROOMS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalRooms(rooms) {
  try {
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
  } catch {}
}

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinnerLocal(board) {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return null;
}

export const multiplayer = {
  // Generate a shareable URL link for a room code
  getShareableLink: (roomCode) => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomCode);
    return url.toString();
  },

  // 1. Create a new 2-player room
  createRoom: async (hostPlayer, game = 'tic-tac-toe') => {
    // Try backend API first
    try {
      const res = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: hostPlayer, game }),
        signal: AbortSignal.timeout(3500),
      });
      const data = await res.json();
      if (data.success && data.room) {
        if (channel) channel.postMessage({ type: 'ROOM_CREATED', room: data.room });
        return { success: true, room: data.room };
      }
    } catch {
      // Backend offline, fallback to local room
    }

    // Local Fallback
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = 'GZ-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const localRoom = {
      code,
      game,
      host: {
        id: hostPlayer.id || 'p1_' + Date.now(),
        name: hostPlayer.name || 'Host Player',
        username: hostPlayer.username || hostPlayer.name,
        avatar: hostPlayer.avatar || '🎮',
        photo: hostPlayer.photo || '',
      },
      guest: null,
      status: 'waiting',
      board: Array(9).fill(null),
      currentTurn: 'X',
      winner: null,
      winningLine: null,
      scores: { host: 0, guest: 0, draws: 0 },
      lastActivity: Date.now(),
    };

    const rooms = getLocalRooms();
    rooms[code] = localRoom;
    saveLocalRooms(rooms);

    if (channel) channel.postMessage({ type: 'ROOM_CREATED', room: localRoom });
    return { success: true, room: localRoom };
  },

  // 2. Join room with code
  joinRoom: async (roomCode, guestPlayer) => {
    const cleanCode = roomCode.trim().toUpperCase();

    // Try backend API first
    try {
      const res = await fetch(`${API_BASE}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, guest: guestPlayer }),
        signal: AbortSignal.timeout(3500),
      });
      const data = await res.json();
      if (data.success && data.room) {
        if (channel) channel.postMessage({ type: 'ROOM_UPDATED', room: data.room });
        return { success: true, room: data.room, role: data.role || 'guest' };
      }
      if (data.message && !data.message.includes('Failed to fetch')) {
        return { success: false, message: data.message };
      }
    } catch {
      // Backend offline, fallback to local
    }

    // Local Fallback
    const rooms = getLocalRooms();
    const room = rooms[cleanCode];
    if (!room) {
      return { success: false, message: `Room ${cleanCode} not found. Please check code.` };
    }

    const isHost = room.host.id === guestPlayer.id || room.host.username === guestPlayer.username;
    if (isHost) {
      return { success: true, room, role: 'host' };
    }

    if (room.guest && room.guest.id !== guestPlayer.id && room.guest.username !== guestPlayer.username) {
      return { success: false, message: `Room ${cleanCode} is already full.` };
    }

    room.guest = {
      id: guestPlayer.id || 'p2_' + Date.now(),
      name: guestPlayer.name || 'Opponent',
      username: guestPlayer.username || guestPlayer.name,
      avatar: guestPlayer.avatar || '⚡',
      photo: guestPlayer.photo || '',
    };
    room.status = 'playing';
    room.lastActivity = Date.now();
    rooms[cleanCode] = room;
    saveLocalRooms(rooms);

    if (channel) channel.postMessage({ type: 'ROOM_UPDATED', room });
    return { success: true, room, role: 'guest' };
  },

  // 3. Fetch latest room state (Polling)
  fetchRoom: async (roomCode) => {
    const cleanCode = roomCode.trim().toUpperCase();

    // Try backend API
    try {
      const res = await fetch(`${API_BASE}/${cleanCode}`, {
        signal: AbortSignal.timeout(2500),
      });
      const data = await res.json();
      if (data.success && data.room) {
        return { success: true, room: data.room };
      }
    } catch {
      // Backend offline, fallback
    }

    // Local Fallback
    const rooms = getLocalRooms();
    const room = rooms[cleanCode];
    if (room) {
      return { success: true, room };
    }
    return { success: false, message: 'Room not found' };
  },

  // 4. Make a move on the board
  makeMove: async (roomCode, { playerId, cellIndex, symbol }) => {
    const cleanCode = roomCode.trim().toUpperCase();

    // Try backend API
    try {
      const res = await fetch(`${API_BASE}/${cleanCode}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, cellIndex, symbol }),
        signal: AbortSignal.timeout(3000),
      });
      const data = await res.json();
      if (data.success && data.room) {
        if (channel) channel.postMessage({ type: 'ROOM_UPDATED', room: data.room });
        return { success: true, room: data.room };
      }
      if (data.message) {
        return { success: false, message: data.message };
      }
    } catch {
      // Backend offline, fallback
    }

    // Local Fallback
    const rooms = getLocalRooms();
    const room = rooms[cleanCode];
    if (!room) return { success: false, message: 'Room not found' };

    if (room.board[cellIndex] !== null || room.winner) {
      return { success: false, message: 'Invalid move' };
    }

    room.board[cellIndex] = symbol;
    const result = checkWinnerLocal(room.board);
    if (result) {
      room.winner = result.winner;
      room.winningLine = result.line;
      if (result.winner === 'X') room.scores.host += 1;
      else if (result.winner === 'O') room.scores.guest += 1;
      else if (result.winner === 'draw') room.scores.draws += 1;
    } else {
      room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
    }

    room.lastActivity = Date.now();
    rooms[cleanCode] = room;
    saveLocalRooms(rooms);

    if (channel) channel.postMessage({ type: 'ROOM_UPDATED', room });
    return { success: true, room };
  },

  // 5. Request rematch
  rematch: async (roomCode) => {
    const cleanCode = roomCode.trim().toUpperCase();

    // Try backend API
    try {
      const res = await fetch(`${API_BASE}/${cleanCode}/rematch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      const data = await res.json();
      if (data.success && data.room) {
        if (channel) channel.postMessage({ type: 'ROOM_UPDATED', room: data.room });
        return { success: true, room: data.room };
      }
    } catch {}

    // Local Fallback
    const rooms = getLocalRooms();
    const room = rooms[cleanCode];
    if (!room) return { success: false, message: 'Room not found' };

    room.board = Array(9).fill(null);
    room.currentTurn = 'X';
    room.winner = null;
    room.winningLine = null;
    room.status = room.guest ? 'playing' : 'waiting';
    room.lastActivity = Date.now();
    rooms[cleanCode] = room;
    saveLocalRooms(rooms);

    if (channel) channel.postMessage({ type: 'ROOM_UPDATED', room });
    return { success: true, room };
  },

  // 6. Listen for local broadcast updates
  subscribe: (callback) => {
    if (!channel) return () => {};
    const handler = (e) => {
      if (e.data && e.data.room) {
        callback(e.data.room);
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  },
};
