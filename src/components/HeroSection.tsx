import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Play, Plus } from 'lucide-react';
import type { Movie, Video, Credit } from '../lib/api/TMDbServices';

interface HeroSectionProps {
  heroMovie: Movie | null;
  heroTrailer: Video | null;
  heroCast: Credit[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ heroMovie, heroTrailer, heroCast }) => {

  if (!heroMovie) return null;

  const releaseYear = heroMovie.release_date ? new Date(heroMovie.release_date).getFullYear() : '';
  const rating = Math.round(heroMovie.vote_average * 10);

  return (
    <section className="relative h-screen w-screen bg-black overflow-hidden">
      {/* Autoplay trailer background - Cropped to remove gaps */}
      {heroTrailer && (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            id="hero-video-player"
            className="absolute inset-0 w-[130%] h-[130%] object-cover -top-[65px] -left-[32.5px] scale-[1.15] transform"
            src={`https://www.youtube.com/embed/${heroTrailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${heroTrailer.key}&modestbranding=1&rel=0`}
            title="Trailer Background"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          ></iframe>
        </div>
      )}
      {!heroTrailer && heroMovie.backdrop_path && (
        <div
          className="absolute inset-0 w-screen h-screen bg-cover bg-center"
          style={{ backgroundImage: `url(${heroMovie.backdrop_path})` }}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />

      {/* Main content - Left aligned */}
      <div className="relative flex items-center h-full pt-20 pl-12">
        <div className="text-left text-white max-w-4xl animate-fade-in">
          <h1 className="text-6xl font-bold mb-4">{heroMovie.title}</h1>
          
          {/* Metadata */}
          {releaseYear && (
            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-300">
              <span>{releaseYear}</span>
              <span>•</span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-1"></span>
                {rating}%
              </span>
              <span>•</span>
              <span>2h 30m</span> {/* Placeholder; fetch runtime from TMDb if needed */}
            </div>
          )}
          
          <p className="text-lg mb-6 line-clamp-2 opacity-90 max-w-2xl">{heroMovie.overview}</p>
          
          <div className="flex gap-4 items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-12 py-3 rounded-full font-semibold shadow-lg">
                  <Play className="mr-2 h-5 w-5" />
                  Play
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl h-[80vh] p-0">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${heroTrailer?.key || ''}?autoplay=1`}
                  title={heroTrailer?.name || 'Trailer'}
                  allowFullScreen
                ></iframe>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="text-white border-white text-lg px-8 py-3 rounded-full font-semibold hover:bg-white hover:bg-opacity-10">
              <Plus className="mr-2 h-5 w-5" />
              My List
            </Button>
          </div>
        </div>
      </div>

      {/* gradient transisi transparant*/}
      <div className="absolute bottom-0 left-0 right-0 p-8 h-[20%] bg-gradient-to-b from-transparent via-black/80 to-black"></div>
    </section>
  );
};

export default HeroSection;
