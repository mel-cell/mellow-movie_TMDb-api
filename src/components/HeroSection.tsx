import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Play } from 'lucide-react';
import type { Movie, Video, Credit } from '../lib/api/TMDbServices';

interface HeroSectionProps {
  heroMovie: Movie | null;
  heroTrailer: Video | null;
  heroCast: Credit[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ heroMovie, heroTrailer, heroCast }) => {
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    // Load YouTube IFrame Player API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (heroTrailer) {
        const ytPlayer = new (window as any).YT.Player('hero-video-player', {
          videoId: heroTrailer.key,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            loop: 1,
            playlist: heroTrailer.key,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              setPlayer(event.target);
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
              // Restart 2 seconds before end
              const duration = event.target.getDuration();
              const currentTime = event.target.getCurrentTime();
              if (duration - currentTime <= 2 && duration - currentTime > 0) {
                event.target.seekTo(0);
              }
            },
          },
        });
        setPlayer(ytPlayer);
      }
    };

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [heroTrailer]);

  if (!heroMovie) return null;

  return (
    <section className="relative h-[80vh] w-screen bg-black overflow-clip">
      {/* Autoplay trailer background */}
      {heroTrailer && (
        <iframe
          className="absolute inset-0 w-screen h-screen m-0 object-cover top-[-115px]"
          src={`https://www.youtube.com/embed/${heroTrailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${heroTrailer.key}&modestbranding=1&rel=0`}
          title="Trailer Background"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          style={{ width: '100vw', height: '100vh' }}
        ></iframe>
      )}
      {!heroTrailer && heroMovie.backdrop_path && (
        <div
          className="absolute inset-0 w-screen h-screen bg-cover bg-center"
          style={{ backgroundImage: `url(${heroMovie.backdrop_path})` }}
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* Main content */}
      <div className="relative flex items-center justify-center h-full ">
        <div className="text-center text-white max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">{heroMovie.title}</h1>
          <p className="text-xl mb-8 line-clamp-4">{heroMovie.overview}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3">
                  <Play className="mr-2 h-6 w-6" />
                  Play
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl h-[80vh]">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${heroTrailer?.key || ''}`}
                  title={heroTrailer?.name || 'Trailer'}
                  allowFullScreen
                ></iframe>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-white text-white">
              My List
            </Button>
          </div>
        </div>
      </div>

      {/* Cast section at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center space-x-6 overflow-x-auto pb-2">
          {heroCast.map((cast) => (
            <div key={cast.id} className="text-center min-w-[80px] flex-shrink-0">
              {cast.profile_path && (
                <img
                  src={cast.profile_path}
                  alt={cast.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2 object-cover border-2 border-white"
                />
              )}
              <p className="text-sm text-white font-medium line-clamp-1">{cast.name}</p>
              <p className="text-xs text-gray-300 line-clamp-1">{cast.character}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
