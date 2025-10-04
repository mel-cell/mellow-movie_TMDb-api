import { useState, useEffect } from 'react';
import { tmdbService } from '@/lib/api/TMDbServices';
import type { Movie, Video, Credit } from '@/lib/api/TMDbServices';
import HeroSection from '@/components/HeroSection';
import TrendingSection from '@/components/TrendingSection';
import BrowseSection from '@/components/BrowseSection';
import VideoPlayRecommended from '@/components/videoPlayrecomended';

const HomePage: React.FC = () => {
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [heroTrailer, setHeroTrailer] = useState<Video | null>(null);
  const [heroCast, setHeroCast] = useState<Credit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trendingMovieData = await tmdbService.getTrending('movie', 'day');

        // Set hero movie
        if (trendingMovieData.results.length > 0) {
          const randomMovie = trendingMovieData.results[Math.floor(Math.random() * trendingMovieData.results.length)] as Movie;
          setHeroMovie(randomMovie);
          const videos = await tmdbService.getMovieVideos(randomMovie.id);
          setHeroTrailer(videos[0] || null);
          const credits = await tmdbService.getMovieCredits(randomMovie.id);
          setHeroCast(credits.cast.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black ">
      <HeroSection
        heroMovie={heroMovie}
        heroTrailer={heroTrailer}
        heroCast={heroCast}
      />

      <div className="max-w-screen-2xl mx-auto p-5 ">
        <TrendingSection />
      </div>

      <div className="max-w-screen-2xl mx-auto p-5">
        <BrowseSection />
      </div>

      <div className='max-w-screen-2xl mx-auto p-5'>
        {heroMovie && <VideoPlayRecommended movieId={heroMovie.id} />}
      </div>
    </div>
  );
};

export default HomePage;
