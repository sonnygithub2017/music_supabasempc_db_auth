import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import {
  FaClock,
  FaHeart
} from 'react-icons/fa';
import { FiPlus, FiMoreVertical, FiHeart } from 'react-icons/fi';
import { ITrack } from '@/types';
import { getImageUrl, cn } from '@/utils';
import { Button } from './button';
import { getTrackLikeCount, toggleTrackLike, isTrackLikedByUser } from '@/services/LikeService';
import { useAuth } from '@/context/AuthContext';
import { AuthDialog } from '@/components/auth/AuthDialog';

interface TrackCardProps {
  track: ITrack;
  category: string;
  isPlaying?: boolean;
  onPlay?: (track: ITrack) => void;
  onAddToQueue?: (track: ITrack) => void;
  variant?: 'compact' | 'detailed' | 'featured';
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  category: _category,
  isPlaying: _isPlayingProp,
  onPlay: _onPlayProp,
  onAddToQueue,
  variant = 'detailed',
  className
}) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(track.likeCount ?? 0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { poster_path, original_title: title, name, artist, album, duration } = track;
  const displayTitle = title || name || 'Unknown Track';

  const formatDuration = (ms: number) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToQueue) {
      onAddToQueue(track);
      setShowAddedFeedback(true);
      setTimeout(() => setShowAddedFeedback(false), 2000);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  const handleClickOutside = () => {
    setShowContextMenu(false);
  };

  // Fetch initial like count and user's like status on mount
  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        const count = await getTrackLikeCount(track.id);
        setLikeCount(count);

        // Check if user has liked this track
        if (user) {
          const liked = await isTrackLikedByUser(track.id, user.id);
          setIsLiked(liked);
        } else {
          setIsLiked(false);
        }
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };
    fetchLikeData();
  }, [track.id, user]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if user is authenticated
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (isLikeLoading) return;

    // Optimistic update
    const previousCount = likeCount;
    const previousLiked = isLiked;
    const newLiked = !isLiked;
    const newCount = newLiked ? previousCount + 1 : Math.max(0, previousCount - 1);

    setLikeCount(newCount);
    setIsLiked(newLiked);
    setIsLikeLoading(true);

    try {
      // Pass track name and artist name for database records
      const trackName = displayTitle;
      const artistName = artist || 'Unknown Artist';
      const result = await toggleTrackLike(track.id, user.id, trackName, artistName);
      setLikeCount(result.likeCount);
      setIsLiked(result.isLiked);
    } catch (error) {
      // Revert on error
      console.error('Error toggling like:', error);
      setLikeCount(previousCount);
      setIsLiked(previousLiked);
    } finally {
      setIsLikeLoading(false);
    }
  };


  const cardHeight = variant === 'compact' ? 'h-52' : variant === 'featured' ? 'h-84' : 'h-80';
  const imageHeight = variant === 'compact' ? 160 : variant === 'featured' ? 240 : 200;

  return (
    <Card
      className={cn(
        "group relative transition-all duration-300 ease-out overflow-hidden",
        "hover:scale-[1.03] hover:-translate-y-2 cursor-pointer",
        "bg-white dark:bg-card-dark border-0",
        "shadow-sm hover:shadow-card-hover",
        "rounded-xl p-4",
        cardHeight,
        "w-[180px]", // Slightly wider for better proportions
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowContextMenu(false);
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Main Content */}
      <div className="block relative h-full">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-lg mb-3">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-hover-gray animate-pulse rounded-lg"
                 style={{ height: imageHeight }} />
          )}

          {/* Album artwork */}
          <img
            src={getImageUrl(poster_path)}
            alt={displayTitle}
            className={cn(
              "w-full object-cover transition-all duration-300 rounded-lg",
              "group-hover:scale-105",
              "dark:brightness-75 dark:contrast-110 dark:saturate-90",
              "dark:group-hover:brightness-90 dark:group-hover:contrast-105 dark:group-hover:saturate-95",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{ height: imageHeight }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Gradient overlay on hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 rounded-lg",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Action buttons on hover */}
          {isHovered && (
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              {/* Like button */}
              <Button
                onClick={handleToggleLike}
                variant="ghost"
                size="icon"
                disabled={isLikeLoading}
                className={cn(
                  "w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
                  "hover:bg-white dark:hover:bg-gray-800",
                  "shadow-lg transition-all duration-200 hover:scale-110",
                  isLiked
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-400 dark:text-gray-500",
                  isLikeLoading && "opacity-50 cursor-not-allowed"
                )}
                title={isLiked ? "Unlike" : "Like"}
              >
                {isLiked ? (
                  <FaHeart className="w-4 h-4 fill-current" />
                ) : (
                  <FiHeart className="w-4 h-4" />
                )}
              </Button>
              {/* Add to Queue button */}
              {onAddToQueue && (
                <Button
                  onClick={handleAddToQueue}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
                    "hover:bg-white dark:hover:bg-gray-800",
                    "text-gray-900 dark:text-white shadow-lg",
                    "transition-all duration-200 hover:scale-110",
                    showAddedFeedback && "bg-green-500 text-white"
                  )}
                  title="Add to Queue"
                >
                  {showAddedFeedback ? (
                    <span className="text-xs font-bold">✓</span>
                  ) : (
                    <FiPlus className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Track information */}
        <CardContent className="p-0 space-y-2">
          {/* Track title */}
          <h3 className={cn(
            "font-semibold text-gray-900 dark:text-text-primary truncate transition-colors duration-200",
            variant === 'compact' ? "text-sm" : "text-base",
            "group-hover:text-accent-orange dark:group-hover:text-accent-orange"
          )}>
            {displayTitle}
          </h3>

          {/* Artist name */}
          <p className={cn(
            "text-gray-600 dark:text-text-secondary truncate font-medium",
            variant === 'compact' ? "text-xs" : "text-sm"
          )}>
            {artist || 'Unknown Artist'}
          </p>

          {/* Additional info for detailed variant */}
          {variant === 'detailed' && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2 flex-1 mr-2">
                {album && (
                  <span className="text-xs text-text-muted dark:text-text-secondary/70 truncate">
                    {album}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {/* Like count */}
                <div className={cn(
                  "flex items-center text-xs",
                  isLiked
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {isLiked ? (
                    <FaHeart className="w-3 h-3 mr-1 fill-current" />
                  ) : (
                    <FiHeart className="w-3 h-3 mr-1" />
                  )}
                  <span>{likeCount}</span>
                </div>
                {/* Duration */}
                {duration && (
                  <div className="flex items-center text-xs text-text-muted dark:text-text-secondary/70">
                    <FaClock className="w-3 h-3 mr-1 opacity-60" />
                    {formatDuration(duration)}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>

      {/* Hover glow effect */}
      <div className={cn(
        "absolute -inset-1 bg-gradient-to-r from-spotify-green via-accent-orange to-warning-amber rounded-2xl opacity-0 transition-opacity duration-500 -z-10 blur-md",
        "dark:bg-gradient-to-r dark:from-blue-800 dark:via-slate-600 dark:to-blue-800",
        isHovered && "opacity-10"
      )} />

      {/* Context Menu */}
      {showContextMenu && onAddToQueue && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleClickOutside}
          />
          <div className="absolute top-2 right-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToQueue(e);
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add to Queue
            </button>
            {_onPlayProp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  _onPlayProp(track);
                  setShowContextMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <FiMoreVertical className="w-4 h-4" />
                Play Now
              </button>
            )}
          </div>
        </>
      )}

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        initialTab="signin"
      />
    </Card>
  );
};