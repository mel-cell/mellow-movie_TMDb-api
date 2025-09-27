import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { tmdbService } from '@/lib/api/TMDbServices';
import type { Movie, TVShow, Video, Credit } from '@/lib/api/TMDbServices';
import HeroSection from '@/components/HeroSection';
import TrendingSection from '@/components/TrendingSection';
import SearchSection from '@/components/SearchSection';
import SearchBar from '@/components/SearchBar';

const HomePage: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TVShow[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<TVShow[]>([]);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [heroTrailer, setHeroTrailer] = useState<Video | null>(null);
  const [heroCast, setHeroCast] = useState<Credit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingMovieData, trendingTVData, popularMovieData, popularTVData] = await Promise.all([
          tmdbService.getTrending('movie', 'day'),
          tmdbService.getTrending('tv', 'day'),
          tmdbService.getPopularMovies(1),
          tmdbService.getPopularTVShows(1)
        ]);
        setTrendingMovies(trendingMovieData.results.slice(0, 10));
        setTrendingTV(trendingTVData.results.slice(0, 10));
        setPopularMovies(popularMovieData.results.slice(0, 10));
        setPopularTV(popularTVData.results.slice(0, 10));

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const [movieResults, tvResults] = await Promise.all([
        tmdbService.searchMovies(searchQuery),
        tmdbService.searchTVShows(searchQuery)
      ]);
      setSearchResults([...movieResults.results.slice(0, 5), ...tvResults.results.slice(0, 5)]);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection 
        heroMovie={heroMovie} 
        heroTrailer={heroTrailer}
        heroCast={heroCast}
      />

      <div className="max-w-6xl mx-auto p-4">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
        />

        {searchResults.length > 0 && <SearchSection searchResults={searchResults} />}

        <TrendingSection title="TV Shows" items={trendingTV} />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {popularMovies.map((movie) => (
              <Card key={movie.id} className="overflow-hidden">
                {movie.poster_path && (
                  <img src={movie.poster_path} alt={movie.title} className="w-full h-72 object-cover" />
                )}
                <CardContent className="p-2">
                  <p className="text-sm font-medium line-clamp-1">{movie.title}</p>
                  <p className="text-xs text-muted-foreground">Rating: {movie.vote_average}/10</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <TrendingSection title="Popular TV Shows" items={popularTV} />
      </div>
    </div>
  );
};

export default HomePage;
