import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2, FiMove, FiPlay } from 'react-icons/fi';
import { ITrack } from '@/types';
import { getImageUrl, cn } from '@/utils';
import { Button } from './button';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  queue: ITrack[];
  currentTrack: ITrack | null;
  currentQueueIndex: number;
  isPlaying: boolean;
  onRemoveTrack: (trackId: string) => void;
  onReorderQueue: (fromIndex: number, toIndex: number) => void;
  onPlayTrack: (track: ITrack) => void;
  onClearQueue: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  isOpen,
  onClose,
  queue,
  currentTrack,
  currentQueueIndex,
  isPlaying,
  onRemoveTrack,
  onReorderQueue,
  onPlayTrack,
  onClearQueue,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const formatDuration = (ms: number) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorderQueue(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Separate current track from upcoming tracks
  // If no track is currently playing (currentQueueIndex === -1), show all tracks as upcoming
  // Otherwise, filter out the currently playing track
  const upcomingTracks = currentQueueIndex >= 0
    ? queue.filter((_, index) => index !== currentQueueIndex)
    : queue;

  // Get the currently playing track from queue if index is valid
  const nowPlayingTrack = currentQueueIndex >= 0 && currentQueueIndex < queue.length
    ? queue[currentQueueIndex]
    : currentTrack;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-[60] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Queue</h2>
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearQueue}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!queue || queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <FiPlay className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Your queue is empty
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add songs to your queue to see them here
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Currently Playing */}
                  {nowPlayingTrack && currentQueueIndex >= 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                        Now Playing
                      </h3>
                      <div
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border-2",
                          "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20",
                          "border-blue-200 dark:border-blue-800",
                          "shadow-md"
                        )}
                      >
                        <img
                          src={getImageUrl(nowPlayingTrack.poster_path)}
                          alt={nowPlayingTrack.title || nowPlayingTrack.name}
                          className="w-16 h-16 rounded-lg object-cover shadow-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {nowPlayingTrack.title || nowPlayingTrack.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {nowPlayingTrack.artist || 'Unknown Artist'}
                          </p>
                          {nowPlayingTrack.duration && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {formatDuration(nowPlayingTrack.duration)}
                            </p>
                          )}
                        </div>
                        {isPlaying && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                            <div className="w-1 h-6 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                            <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Tracks / Queue List */}
                  {upcomingTracks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                        {currentQueueIndex >= 0 ? `Up Next (${upcomingTracks.length})` : `Queue (${upcomingTracks.length})`}
                      </h3>
                      <div className="space-y-2">
                        {upcomingTracks.map((track, displayIndex) => {
                          // Calculate actual index in queue
                          // If currentQueueIndex is -1, all tracks are shown, so index matches
                          // Otherwise, we need to map display index back to queue index
                          const actualIndex = currentQueueIndex >= 0
                            ? (displayIndex < currentQueueIndex ? displayIndex : displayIndex + 1)
                            : displayIndex;
                          const isDragging = draggedIndex === actualIndex;
                          const isDragOver = dragOverIndex === actualIndex;

                          return (
                            <div
                              key={track.id}
                              draggable
                              onDragStart={() => handleDragStart(actualIndex)}
                              onDragOver={(e) => handleDragOver(e, actualIndex)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, actualIndex)}
                              onDragEnd={handleDragEnd}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                                "hover:bg-gray-50 dark:hover:bg-gray-750",
                                "cursor-move",
                                isDragging && "opacity-50",
                                isDragOver && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              )}
                            >
                              <FiMove className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                              <img
                                src={getImageUrl(track.poster_path)}
                                alt={track.title || track.name}
                                className="w-12 h-12 rounded object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                  {track.title || track.name}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {track.artist || 'Unknown Artist'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {track.duration && (
                                  <span className="text-xs text-gray-500 dark:text-gray-500">
                                    {formatDuration(track.duration)}
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onPlayTrack(track)}
                                  className="w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <FiPlay className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onRemoveTrack(track.id)}
                                  className="w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

