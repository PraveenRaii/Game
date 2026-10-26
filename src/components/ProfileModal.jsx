import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, User, Trophy, Award, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { soundEffects } from '../audio/soundEffects';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, AVATARS } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(currentUser.name || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '🎮');
  const [photo, setPhoto] = useState(currentUser.photo || '');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url' | 'avatar'

  if (!isOpen) return null;

  // Handle local file upload & convert to base64
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast({
        title: 'Image Too Large',
        message: 'Please choose an image under 2MB.',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      soundEffects.playClick();
      addToast({
        title: 'Photo Selected! 📸',
        message: 'Click Save Profile to update your account.',
        type: 'info',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!photoUrlInput.trim()) return;
    setPhoto(photoUrlInput.trim());
    soundEffects.playClick();
    addToast({
      title: 'Photo URL Applied',
      message: 'Click Save Profile to finalize.',
      type: 'info',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    const res = await updateProfile({
      name,
      avatar,
      photo,
    });

    if (res?.success) {
      soundEffects.playWin();
      addToast({
        title: 'Profile Updated! ✨',
        message: 'Your gamer photo & display name have been saved.',
        type: 'success',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-3xl glass-panel-glow p-6 sm:p-8 border border-white/10 shadow-2xl my-8"
      >
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-['Orbitron'] text-2xl font-bold text-white">
            Player Profile &amp; Photo
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Customize your gamer identity across the GameZone arena
          </p>
        </div>

        {/* Current Photo Preview */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            {photo ? (
              <img
                src={photo}
                alt="Profile Preview"
                className="w-24 h-24 rounded-3xl object-cover border-2 border-cyan-400 shadow-xl shadow-cyan-500/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 flex items-center justify-center text-4xl shadow-xl">
                {avatar}
              </div>
            )}

            <label
              htmlFor="photo-upload-input"
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg cursor-pointer transition-all active:scale-95"
              title="Upload New Photo"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              id="photo-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <p className="text-xs font-bold text-white mt-3">{currentUser.name}</p>
          <p className="text-[11px] text-purple-300">@{currentUser.username}</p>
        </div>

        {/* Photo Mode Switcher */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-white/5 border border-white/10 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setPhotoMode('upload')}
            className={`py-1.5 rounded-lg transition-all ${
              photoMode === 'upload' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setPhotoMode('url')}
            className={`py-1.5 rounded-lg transition-all ${
              photoMode === 'url' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Image URL
          </button>
          <button
            type="button"
            onClick={() => setPhotoMode('avatar')}
            className={`py-1.5 rounded-lg transition-all ${
              photoMode === 'avatar' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Preset Avatar
          </button>
        </div>

        {/* Mode Form Details */}
        {photoMode === 'upload' && (
          <div className="mb-5 p-4 rounded-2xl bg-white/5 border border-dashed border-white/15 text-center">
            <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <label
              htmlFor="modal-file-upload"
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer block"
            >
              Click to choose image file
            </label>
            <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WebP or GIF up to 2MB</p>
            <input
              id="modal-file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {photoMode === 'url' && (
          <div className="mb-5 space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/avatar.png"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
              >
                Apply
              </button>
            </div>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Clear Custom Photo &amp; Use Avatar
              </button>
            )}
          </div>
        )}

        {photoMode === 'avatar' && (
          <div className="mb-5">
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setAvatar(av);
                    setPhoto(''); // Clear photo so avatar is used
                  }}
                  className={`h-10 text-lg rounded-xl flex items-center justify-center transition-all ${
                    avatar === av && !photo
                      ? 'bg-purple-600/40 border-2 border-purple-400 shadow-md scale-105'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Display Name Input */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white border border-white/10 bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black font-bold text-xs shadow-md shadow-cyan-500/25 hover:shadow-cyan-400/40"
            >
              Save Profile
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
