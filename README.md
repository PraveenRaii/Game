# GameZone – Play, Think & Win! 🎮

A modern, responsive, and full-stack gaming platform built with **React 19**, **Tailwind CSS v4**, **Node.js / Express**, **MongoDB Atlas**, **Framer Motion**, **Lucide Icons**, and the **Web Audio API**.

---

## 🌟 What's New: Database, Admin Console, Themes & Profile Photos

### 1. 🍃 MongoDB Atlas Cloud Database Integration
- **Database Connection**: Configured and connected to MongoDB Atlas (`gamezone` cluster).
- **Persistent Schemas**:
  - `User`: Manages player profiles, custom photos, avatars, hashed passwords, roles (`player` / `admin`), and all-time game statistics.
  - `Game`: Dynamic games repository allowing administrators to add new games, change configurations, toggle active status, and customize badges.
  - `Score`: Global hall-of-fame records with player photo, game type, score details, and XP points.
- **Offline Resilient**: Falls back gracefully to `localStorage` if network connectivity is interrupted, ensuring zero crashes.

---

### 2. 🛡️ Comprehensive Admin Dashboard (`/admin`)
- Accessible to users with the `admin` role (Default credentials: username `admin`, password `admin`).
- **Overview Analytics**:
  - Live **MongoDB Atlas Connection Status** with pulsing health indicator.
  - Real-time counters for **Total Users**, **Active Games**, and **Leaderboard Scores**.
- **Game Management**:
  - **Add New Game**: Modal to create games with custom title, tagline, description, difficulty, accent color, category, and badges.
  - **Edit Game**: Update details, categories, and tags on the fly.
  - **Publish / Hide Toggle**: Instantly activate or hide any game from players.
  - **Delete Game**: Remove outdated or retired games.
- **User Data Management**:
  - View **All User Data** directly from MongoDB (profile photo, name, username, email, games played, victories, registration date).
  - **Role Management**: Promote players to `admin` or demote to `player` with one click.
  - **Account Deletion**: Remove accounts with confirmation safeguards.
- **Score Moderation**: Inspect recorded scores and remove test entries.

---

### 3. 🌗 Dark & Light Theme Across ALL Pages
- **Global Theme Switcher**: Toggle between Cyberpunk Dark Mode and Sleek Modern Light Mode via the Sun/Moon button in the navigation bar.
- **Consistent Styling Across All Views**:
  - **Dark Mode**: Cyberpunk neon accents (cyan `#06b6d4`, purple `#a855f7`, pink `#ec4899`), deep frosted glassmorphism, glowing text, and ambient radial flares.
  - **Light Mode**: High-contrast modern gaming dashboard with crisp borders, soft elevation shadows, and deep readable slate typography.
- Persisted automatically in browser preferences.

---

### 4. 📸 Custom Profile Photo for Users
- **Upload Local Image**: Upload JPG, PNG, WebP, or GIF images directly from your device (stored as Base64 data in MongoDB).
- **Image URL**: Enter any web avatar URL.
- **Preset Avatars**: Choose from 12 styled gaming emojis.
- **Shown Everywhere**: Displayed on Navbar profile chip, Profile Edit modal, Leaderboard ranks, and the Admin user management table.

---

## 🕹️ Interactive Games

### 1. 🔢 Number Guessing Game
- **3 Difficulty Tiers**: Easy (1–50, 10 attempts), Medium (1–100, 7 attempts), Hard (1–500, 8 attempts).
- **Dynamic Hints**: `"Too High! 🔻"`, `"Too Low! 🔺"`, `"Correct Guess! 🎉"`, and bonus proximity clues (*"🔥 Super Close!"*).
- **Visual Fuel Gauge**: Real-time progress bar + heart indicators for remaining attempts.
- **Validation**: Checks bounds and duplicate guesses.

### 2. ⚔️ Tic-Tac-Toe
- **3×3 Neon Grid**: Play as **X** or **O**.
- **Two Modes**: Player vs Computer (AI) or 2-Player Local Pass & Play.
- **Unbeatable Minimax AI**: Hard mode runs the mathematical Minimax algorithm with alpha-beta pruning.
- **Winning Line Highlight**: Dynamically illuminates the winning 3-in-a-row combination.

### 3. 🧩 Sliding Number Puzzle
- **3 Grid Modes**: 3×3 (8 tiles), 4×4 (15 tiles), and 5×5 (24 tiles).
- **100% Solvable Guarantee**: Inversion parity checking ensures every board is mathematically solvable.
- **Controls**: Mouse click or **Arrow Keys / WASD** on keyboard.
- **Smart AI Hint**: Uses Manhattan distance calculation to recommend the best next tile.
- **Timer & Moves Counter**: Live stopwatch and move tracker.

### 4. 🏎️ Cyber Racer – Car Racing Game
- **3-Lane Cyber Highway**: Navigate high-speed highway traffic with real-time lane switches.
- **Dynamic Entities**: Oncoming sports cars, delivery trucks, neon gold coins, nitro turbo canisters, and shield repair pickups.
- **Interactive Driving Mechanics**:
  - Speedometer scaling up to 260+ KM/H.
  - Interactive Nitro Energy Gauge with speed burst and invulnerability.
  - Heart/Lives indicator (3 hearts) with collision detection and temporary invulnerability frames.
- **Controls**: Arrow Keys / WASD, Space for Nitro boost, or mobile on-screen buttons.
- **Difficulty Tiers**: Cruiser (Easy), Neon Pro (Medium), and Cyber Mania (Hard).
- **Audio & FX**: Engine revs, car move whooshes, coin chimes, turbo sound effects, crash audio, and confetti on record breaks.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18 or higher recommended; v20 LTS tested)
- npm (v9 or higher)

### Run Client & MongoDB Backend Concurrently (Recommended)

1. Open your terminal in the project directory:
   ```bash
   cd c:\Users\navee\Desktop\Game
   ```

2. Run both the Express backend and the Vite client with a single command:
   ```bash
   npm run dev:all
   ```

3. Open your browser:
   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000/api/health`

---

### Running Separately

If you prefer running in two separate terminal windows:

- **Terminal 1 (Backend Server)**:
  ```bash
  npm run server
  ```
- **Terminal 2 (Frontend Client)**:
  ```bash
  npm run dev
  ```

---


