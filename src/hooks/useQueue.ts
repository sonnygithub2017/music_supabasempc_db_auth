import { useState, useCallback, useEffect } from 'react';
import { ITrack } from '@/types';

const QUEUE_STORAGE_KEY = 'nextsound_queue';
const CURRENT_QUEUE_INDEX_KEY = 'nextsound_queue_index';

export const useQueue = () => {
  const [queue, setQueue] = useState<ITrack[]>(() => {
    // Load queue from localStorage on initialization
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse queue from localStorage:', e);
          return [];
        }
      }
    }
    return [];
  });

  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(() => {
    // Load current index from localStorage on initialization
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CURRENT_QUEUE_INDEX_KEY);
      if (stored) {
        try {
          return parseInt(stored, 10);
        } catch (e) {
          return -1;
        }
      }
    }
    return -1;
  });

  // Persist queue to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
  }, [queue]);

  // Persist current index to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_QUEUE_INDEX_KEY, currentQueueIndex.toString());
    }
  }, [currentQueueIndex]);

  const addToQueue = useCallback((track: ITrack) => {
    setQueue(prev => {
      // Check if track is already in queue
      const exists = prev.some(t => t.id === track.id);
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, track];
    });
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue(prev => {
      const newQueue = prev.filter(t => t.id !== trackId);
      // Adjust current index if needed
      const removedIndex = prev.findIndex(t => t.id === trackId);
      if (removedIndex !== -1) {
        if (currentQueueIndex === removedIndex) {
          // If we removed the currently playing track, move to next or previous
          setCurrentQueueIndex(-1);
        } else if (currentQueueIndex > removedIndex) {
          // If we removed a track before the current one, decrement index
          setCurrentQueueIndex(prevIndex => prevIndex - 1);
        }
      }
      return newQueue;
    });
  }, [currentQueueIndex]);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);

      // Adjust current index if needed
      if (currentQueueIndex === fromIndex) {
        setCurrentQueueIndex(toIndex);
      } else if (currentQueueIndex === toIndex) {
        if (fromIndex < toIndex) {
          setCurrentQueueIndex(prevIndex => prevIndex - 1);
        } else {
          setCurrentQueueIndex(prevIndex => prevIndex + 1);
        }
      } else if (currentQueueIndex > fromIndex && currentQueueIndex < toIndex) {
        setCurrentQueueIndex(prevIndex => prevIndex - 1);
      } else if (currentQueueIndex < fromIndex && currentQueueIndex > toIndex) {
        setCurrentQueueIndex(prevIndex => prevIndex + 1);
      }

      return newQueue;
    });
  }, [currentQueueIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentQueueIndex(-1);
  }, []);

  const getQueue = useCallback(() => {
    return queue;
  }, [queue]);

  const setCurrentIndex = useCallback((index: number) => {
    setCurrentQueueIndex(index);
  }, []);

  const getCurrentTrack = useCallback(() => {
    if (currentQueueIndex >= 0 && currentQueueIndex < queue.length) {
      return queue[currentQueueIndex];
    }
    return null;
  }, [queue, currentQueueIndex]);

  const getNextTrack = useCallback(() => {
    if (currentQueueIndex >= 0 && currentQueueIndex < queue.length - 1) {
      return queue[currentQueueIndex + 1];
    }
    return null;
  }, [queue, currentQueueIndex]);

  const getPreviousTrack = useCallback(() => {
    if (currentQueueIndex > 0 && currentQueueIndex < queue.length) {
      return queue[currentQueueIndex - 1];
    }
    return null;
  }, [queue, currentQueueIndex]);

  return {
    queue,
    currentQueueIndex,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    getQueue,
    setCurrentIndex,
    getCurrentTrack,
    getNextTrack,
    getPreviousTrack,
  };
};

