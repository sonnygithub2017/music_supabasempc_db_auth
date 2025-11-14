import { FC } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import { TrackCard } from "@/components/ui/TrackCard";
import { ITrack } from "@/types";
import { useAudioPlayerContext } from "@/context/audioPlayerContext";

interface MusicSlidesProps {
  tracks: ITrack[];
  category: string;
  useModernCards?: boolean;
}

const MusicSlides: FC<MusicSlidesProps> = ({ tracks, category, useModernCards: _useModernCards = true }) => {
  const { playTrack, addToQueue, currentTrack, openQueuePanel } = useAudioPlayerContext();

  const handlePlay = (track: ITrack) => {
    playTrack(track);
  };

  const handleAddToQueue = (track: ITrack) => {
    addToQueue(track);
    openQueuePanel(); // Open queue panel when adding a track
  };


  return (
    <Swiper slidesPerView="auto" spaceBetween={15} className="mySwiper">
      {tracks.map((track) => {
        return (
          <SwiperSlide
            key={track.id}
            className="flex mt-1 flex-col xs:gap-[14px] gap-2 max-w-[170px] rounded-lg"
          >
            <TrackCard
              track={track}
              category={category}
              isPlaying={currentTrack?.id === track.id}
              onPlay={handlePlay}
              onAddToQueue={handleAddToQueue}
              variant="detailed"
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default MusicSlides;