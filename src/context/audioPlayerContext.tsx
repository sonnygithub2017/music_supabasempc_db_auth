import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { ITrack } from '@/types';

interface AudioPlayerContextType {
  currentTrack: ITrack | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'one' | 'all';
  isMinimized: boolean;
  playTrack: (track: ITrack) => void;
  togglePlay: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
  // Queue operations
  queue: ITrack[];
  currentQueueIndex: number;
  addToQueue: (track: ITrack) => void;
  removeFromQueue: (trackId: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  // Queue panel control
  isQueueOpen: boolean;
  openQueuePanel: () => void;
  closeQueuePanel: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioPlayer = useAudioPlayer();

  return (
    <AudioPlayerContext.Provider value={audioPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayerContext must be used within AudioPlayerProvider');
  }
  return context;
};

