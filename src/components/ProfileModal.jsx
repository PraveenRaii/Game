import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Camera } from 'lucide-react';
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
        title: 'Photo Selected 📸',
        message: 'Click Save Profile to update your identity.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md rounded-3xl surface-card p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl my-8"
      >
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Player Profile &amp; Photo
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
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
                className="w-24 h-24 rounded-3xl object-cover border-2 border-[var(--primary-accent-border)] shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-[var(--bg-elevated)] border-2 border-[var(--primary-accent-border)] text-[var(--primary-accent)] flex items-center justify-center text-4xl shadow-sm">
                {avatar}
              </div>
            )}

            <label
              htmlFor="photo-upload-input"
              className="absolute -bottom-2 -right-2 p-2 rounded-xl btn-primary shadow-md cursor-pointer transition-all active:scale-95"
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

          <p className="text-xs font-bold text-[var(--text-primary)] mt-3">{currentUser.name}</p>
          <p className="text-[11px] font-mono-stats text-[var(--primary-accent)]">@{currentUser.username}</p>
        </div>

        {/* Photo Mode Switcher */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPhotoMode('upload')}
            className={`py-1.5 rounded-lg transition-all ${
              photoMode === 'upload' ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setPhotoMode('url')}
            className={`py-1.5 rounded-lg transition-all ${
              photoMode === 'url' ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Image URL
          </button>
          <button
            type="button"
            onClick={() => setPhotoMode('avatar')}
            className={`py-1.5 rounded-lg transition-all ${
              photoMode === 'avatar' ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Preset Avatar
          </button>
        </div>

        {/* Mode Form Details */}
        {photoMode === 'upload' && (
          <div className="mb-5 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-dashed border-[var(--border-color)] text-center">
            <Upload className="w-6 h-6 text-[var(--primary-accent)] mx-auto mb-2" />
            <label
              htmlFor="modal-file-upload"
              className="text-xs font-semibold text-[var(--primary-accent)] hover:underline cursor-pointer block"
            >
              Choose image file
            </label>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-sans">PNG, JPG, WebP up to 2MB</p>
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
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--primary-accent)]"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3.5 py-2 rounded-xl btn-primary text-xs font-bold"
              >
                Apply
              </button>
            </div>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="text-[11px] text-red-500 hover:underline"
              >
                Clear Photo &amp; Use Avatar
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
                    setPhoto('');
                  }}
                  className={`h-10 text-lg rounded-xl flex items-center justify-center transition-all ${
                    avatar === av && !photo
                      ? 'bg-[var(--primary-accent-subtle)] border-2 border-[var(--primary-accent)] scale-105'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--primary-accent-border)]'
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
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-accent)] font-sans"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl btn-secondary text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-bold"
            >
              Save Profile
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
