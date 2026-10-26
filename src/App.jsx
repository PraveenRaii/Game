import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { Home } from './pages/Home';
import { NumberGuessing } from './pages/NumberGuessing';
import { TicTacToe } from './pages/TicTacToe';
import { Puzzle } from './pages/Puzzle';
import { CarRacing } from './pages/CarRacing';
import { Leaderboard } from './pages/Leaderboard';
import { Achievements } from './pages/Achievements';
import { About } from './pages/About';
import { AuthPage } from './pages/AuthPage';
import { Admin } from './pages/Admin';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { GameStatsProvider } from './context/GameStatsContext';
import { ThemeProvider } from './context/ThemeContext';

function GameApp() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'guess-game' | 'tic-tac-toe' | 'puzzle-game' | 'car-racing' | 'leaderboard' | 'achievements' | 'about' | 'auth' | 'admin'
  const [authModalState, setAuthModalState] = useState({ isOpen: false, tab: 'signin' });
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const openAuthModal = (tab = 'signin') => {
    setAuthModalState({ isOpen: true, tab });
  };

  const closeAuthModal = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const openProfileModal = () => {
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
  };

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] relative selection:bg-cyan-500 selection:text-black transition-colors duration-300">
      {/* Background ambient glowing shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-[140px]" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleNavigate}
        openAuthModal={openAuthModal}
        openProfileModal={openProfileModal}
      />

      {/* Main Content Router */}
      <main className="flex-1 relative z-10">
        {currentView === 'home' && (
          <Home setCurrentView={handleNavigate} openAuthModal={openAuthModal} />
        )}

        {currentView === 'games' && (
          <Home setCurrentView={handleNavigate} openAuthModal={openAuthModal} />
        )}

        {currentView === 'car-racing' && (
          <CarRacing setCurrentView={handleNavigate} />
        )}

        {currentView === 'guess-game' && (
          <NumberGuessing setCurrentView={handleNavigate} />
        )}

        {currentView === 'tic-tac-toe' && (
          <TicTacToe setCurrentView={handleNavigate} />
        )}

        {currentView === 'puzzle-game' && (
          <Puzzle setCurrentView={handleNavigate} />
        )}

        {currentView === 'leaderboard' && (
          <Leaderboard setCurrentView={handleNavigate} />
        )}

        {currentView === 'achievements' && (
          <Achievements setCurrentView={handleNavigate} />
        )}

        {currentView === 'about' && (
          <About setCurrentView={handleNavigate} />
        )}

        {currentView === 'auth' && (
          <AuthPage setCurrentView={handleNavigate} initialMode={authModalState.tab} />
        )}

        {currentView === 'admin' && (
          <Admin setCurrentView={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer setCurrentView={handleNavigate} />

      {/* Quick Auth Popup Modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialTab={authModalState.tab}
        onClose={closeAuthModal}
      />

      {/* Profile & Photo Edit Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={closeProfileModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <GameStatsProvider>
            <GameApp />
          </GameStatsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
