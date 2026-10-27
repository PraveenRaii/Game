import React, { useState, useEffect } from 'react';
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
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameStatsProvider } from './context/GameStatsContext';
import { ThemeProvider } from './context/ThemeContext';
import { soundEffects } from './audio/soundEffects';

function GameApp() {
  const [currentView, setCurrentView] = useState('home');
  const [authModalState, setAuthModalState] = useState({ isOpen: false, tab: 'signup' });
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const openAuthModal = (tab = 'signup') => {
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

  const GAME_VIEWS = ['guess-game', 'tic-tac-toe', 'puzzle-game', 'car-racing'];

  // Intercept navigation: Require signup to play any game
  const handleNavigate = (viewId) => {
    if (GAME_VIEWS.includes(viewId) && currentUser.isGuest) {
      soundEffects.playHint(false);
      addToast({
        title: 'Sign Up Required 🔒',
        message: 'Please create an account or sign in to play games!',
        type: 'info',
      });
      openAuthModal('signup');
      return;
    }
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guard: If guest somehow lands on a game route, redirect to home & prompt signup
  useEffect(() => {
    if (GAME_VIEWS.includes(currentView) && currentUser.isGuest) {
      setCurrentView('home');
      openAuthModal('signup');
    }
  }, [currentView, currentUser.isGuest]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] relative selection:bg-[var(--primary-accent)] selection:text-[var(--btn-text-on-accent)] transition-colors duration-250">
      {/* Background ambient lighting - subtle lime & charcoal */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--primary-accent)] opacity-[0.05] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[var(--primary-accent)] opacity-[0.03] rounded-full blur-[130px]" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
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
          <Home setCurrentView={handleNavigate} openAuthModal={openAuthModal} initialSection="games" />
        )}

        {currentView === 'car-racing' && (
          <CarRacing setCurrentView={handleNavigate} openAuthModal={openAuthModal} />
        )}

        {currentView === 'guess-game' && (
          <NumberGuessing setCurrentView={handleNavigate} openAuthModal={openAuthModal} />
        )}

        {currentView === 'tic-tac-toe' && (
          <TicTacToe setCurrentView={handleNavigate} openAuthModal={openAuthModal} />
        )}

        {currentView === 'puzzle-game' && (
          <Puzzle setCurrentView={handleNavigate} openAuthModal={openAuthModal} />
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

      {/* Auth Modal (Sign In / Sign Up) */}
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
