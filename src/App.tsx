import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import {
  Header,
  Footer,
  SideBar,
  ScrollToTop,
  Loader,
  ErrorBoundary,
  DemoModeBadge,
} from "@/common";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { MiniPlayer } from "@/components/ui/MiniPlayer";
import { QueuePanel } from "@/components/ui/QueuePanel";
import { useAudioPlayerContext } from "@/context/audioPlayerContext";

import "react-loading-skeleton/dist/skeleton.css";
import "swiper/css";

const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AppContent = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const audioPlayer = useAudioPlayerContext();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <SideBar />
      <Header onOpenSearch={() => setIsCommandPaletteOpen(true)} />
      <DemoModeBadge />
      <main className="transition-all duration-300 lg:pb-14 md:pb-4 sm:pb-2 xs:pb-1 pb-0 bg-white dark:bg-deep-dark min-h-screen">
        <ScrollToTop>
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </ScrollToTop>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onItemSelect={() => {
          // Item selection handled by CommandPalette component
        }}
      />

      {/* Queue Panel - rendered at root level for proper positioning */}
      <QueuePanel
        isOpen={audioPlayer.isQueueOpen}
        onClose={audioPlayer.closeQueuePanel}
        queue={audioPlayer.queue}
        currentTrack={audioPlayer.currentTrack}
        currentQueueIndex={audioPlayer.currentQueueIndex}
        isPlaying={audioPlayer.isPlaying}
        onRemoveTrack={audioPlayer.removeFromQueue}
        onReorderQueue={audioPlayer.reorderQueue}
        onPlayTrack={audioPlayer.playTrack}
        onClearQueue={audioPlayer.clearQueue}
      />

      {/* Mini Player */}
      <MiniPlayer
        currentTrack={audioPlayer.currentTrack}
        isPlaying={audioPlayer.isPlaying}
        progress={audioPlayer.progress}
        volume={audioPlayer.volume}
        isShuffled={audioPlayer.isShuffled}
        repeatMode={audioPlayer.repeatMode}
        isMinimized={audioPlayer.isMinimized}
        onTogglePlay={audioPlayer.togglePlay}
        onSkipPrevious={audioPlayer.skipPrevious}
        onSkipNext={audioPlayer.skipNext}
        onSeek={audioPlayer.seek}
        onVolumeChange={audioPlayer.setVolume}
        onToggleShuffle={audioPlayer.toggleShuffle}
        onToggleRepeat={audioPlayer.toggleRepeat}
        onToggleFavorite={audioPlayer.toggleFavorite}
        onToggleMinimize={audioPlayer.toggleMinimize}
        queue={audioPlayer.queue}
        currentQueueIndex={audioPlayer.currentQueueIndex}
        onRemoveFromQueue={audioPlayer.removeFromQueue}
        onReorderQueue={audioPlayer.reorderQueue}
        onPlayTrack={audioPlayer.playTrack}
        onClearQueue={audioPlayer.clearQueue}
        isQueueOpen={audioPlayer.isQueueOpen}
        onOpenQueue={audioPlayer.openQueuePanel}
        onCloseQueue={audioPlayer.closeQueuePanel}
      />

      <Footer />
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
