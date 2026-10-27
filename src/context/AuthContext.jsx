import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { soundEffects } from '../audio/soundEffects';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AVATARS = ['🎮', '⚡', '🤖', '🔮', '🛡️', '🥷', '🌀', '🔥', '🚀', '👑', '🐉', '👾'];

const DEFAULT_GUEST = {
  id: 'guest',
  username: 'Guest_Challenger',
  name: 'Guest Player',
  email: '',
  avatar: '🎮',
  photo: '',
  role: 'player',
  isGuest: true,
  createdAt: new Date().toISOString(),
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, DEFAULT_GUEST);
  });

  const [users, setUsers] = useState(() => {
    return getFromStorage(STORAGE_KEYS.USERS, []);
  });

  // Sync session changes to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
  }, [currentUser]);

  // Sync users list to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users]);

  // Sign up new user (MongoDB + LocalStorage sync)
  const signup = async ({ name, username, email, password, avatar = '🎮', photo = '', role = 'player' }) => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedEmail = email?.trim().toLowerCase() || '';

    if (!trimmedEmail) {
      return { success: false, message: 'Email address is required.' };
    }

    // Try MongoDB backend
    try {
      const apiRes = await api.register({
        name: name?.trim() || username.trim(),
        username: trimmedUser,
        email: trimmedEmail,
        password,
        avatar: avatar || '🎮',
        photo: photo || '',
        role: role || (trimmedUser === 'admin' ? 'admin' : 'player'),
      });

      if (apiRes.success && apiRes.user) {
        const mongoUser = {
          ...apiRes.user,
          isGuest: false,
        };
        setCurrentUser(mongoUser);
        setUsers((prev) => [mongoUser, ...prev.filter((u) => u.username !== mongoUser.username)]);
        soundEffects.playWin();
        return { success: true, user: mongoUser };
      } else if (apiRes.message && !apiRes.message.includes('Backend unreachable')) {
        return { success: false, message: apiRes.message };
      }
    } catch {
      // fallback to local
    }

    // LocalStorage Fallback if backend is unreachable
    const exists = users.find(
      (u) => u.username.toLowerCase() === trimmedUser || (u.email && u.email.toLowerCase() === trimmedEmail)
    );

    if (exists) {
      return { success: false, message: 'Username or email is already registered.' };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name?.trim() || username.trim(),
      username: username.trim(),
      email: trimmedEmail,
      password,
      avatar: avatar || '🎮',
      photo: photo || '',
      role: trimmedUser === 'admin' ? 'admin' : role || 'player',
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    soundEffects.playWin();

    return { success: true, user: newUser };
  };

  // Sign in existing user (MongoDB + LocalStorage sync)
  const login = async ({ identifier, password }) => {
    const term = identifier.trim().toLowerCase();

    // Try MongoDB backend first
    try {
      const apiRes = await api.login({ identifier: term, password });
      if (apiRes.success && apiRes.user) {
        const mongoUser = {
          ...apiRes.user,
          isGuest: false,
        };
        setCurrentUser(mongoUser);
        soundEffects.playClick();
        return { success: true, user: mongoUser };
      } else if (apiRes.message && !apiRes.message.includes('Backend unreachable')) {
        return { success: false, message: apiRes.message };
      }
    } catch {
      // fallback
    }

    // Local Fallback
    const user = users.find(
      (u) => (u.username.toLowerCase() === term || (u.email && u.email.toLowerCase() === term)) && u.password === password
    );

    // Built-in emergency admin fallback credentials
    if (!user && (term === 'admin' || term === 'praveen12342020@gmail.com') && password === 'praveen@2020') {
      const adminFallback = {
        id: 'admin_root',
        name: 'Praveen',
        username: 'admin',
        email: 'praveen12342020@gmail.com',
        avatar: '👑',
        photo: '',
        role: 'admin',
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(adminFallback);
      soundEffects.playClick();
      return { success: true, user: adminFallback };
    }

    if (!user) {
      return { success: false, message: 'Invalid username/email or password.' };
    }

    setCurrentUser(user);
    soundEffects.playClick();
    return { success: true, user };
  };

  // Logout - revert to guest
  const logout = () => {
    setCurrentUser(DEFAULT_GUEST);
    soundEffects.playClick();
  };

  // Switch to guest immediately
  const playAsGuest = () => {
    setCurrentUser(DEFAULT_GUEST);
    soundEffects.playClick();
  };

  // Update profile: Name, Avatar, Photo, or Password (MongoDB sync)
  const updateProfile = async ({ name, avatar, photo, password }) => {
    if (currentUser.isGuest) {
      setCurrentUser((prev) => ({
        ...prev,
        name: name || prev.name,
        avatar: avatar || prev.avatar,
        photo: photo !== undefined ? photo : prev.photo,
      }));
      return { success: true };
    }

    // Sync to MongoDB
    if (currentUser.id && !currentUser.id.startsWith('usr_')) {
      try {
        await api.updateProfile({
          userId: currentUser.id,
          name,
          avatar,
          photo,
          password,
        });
      } catch {
        // fallback
      }
    }

    const updated = {
      ...currentUser,
      name: name || currentUser.name,
      avatar: avatar || currentUser.avatar,
      photo: photo !== undefined ? photo : currentUser.photo,
    };

    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    soundEffects.playClick();
    return { success: true, user: updated };
  };

  const isAdmin = currentUser.role === 'admin' || currentUser.username === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAdmin,
        signup,
        login,
        logout,
        playAsGuest,
        updateProfile,
        AVATARS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
