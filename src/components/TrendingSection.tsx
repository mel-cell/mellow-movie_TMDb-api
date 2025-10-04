import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import type { Movie, TVShow, Genre } from '../lib/api/TMDbServices';
import {
  getMovieGenres,
  getMoviesByGenre,
  getPopularMovies,
  getPopularTVShows,
  getTrending,
  getNowPlayingMovies,
  getOnTheAirTV,
  getTVByGenre
} from '../lib/api/TMDbServices';

type MediaItem = Movie | TVShow;

const TrendingSection: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedGenreId, setSelectedGenreId] = useState<number>(0);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getItemTitle = (item: MediaItem) => ('title' in item ? item.title : item.name);
  const getItemType = (item: MediaItem) => ('title' in item ? 'Movie' : 'TV Show');
  const categoryNames = ['Trending', 'Popular', 'Premieres'];

  const handleCategoryChange = useCallback((category: number) => {
    setSelectedCategory(category);
    setSelectedGenreId(0);
  }, []);

  const handleGenreChange = useCallback((genreId: number) => {
    setSelectedGenreId(genreId);
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getMovieGenres();
        setGenres(genresData);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  const fetchItems = useCallback(async () => {
    if (genres.length === 0) return;

    try {
      setLoading(true);
      const isAllGenres = selectedGenreId === 0;
      let moviePromise: Promise<any>;
      let tvPromise: Promise<any>;

      if (isAllGenres) {
        if (selectedCategory === 0) {
          moviePromise = getTrending('movie', 'week');
          tvPromise = getTrending('tv', 'week');
        } else if (selectedCategory === 1) {
          moviePromise = getPopularMovies();
          tvPromise = getPopularTVShows();
        } else {
          moviePromise = getNowPlayingMovies();
          tvPromise = getOnTheAirTV();
        }
      } else {
        moviePromise = getMoviesByGenre(selectedGenreId);
        tvPromise = getTVByGenre(selectedGenreId);
      }

      const [movieData, tvData] = await Promise.all([moviePromise, tvPromise]);

      const movieResults = movieData?.results || [];
      const tvResults = tvData?.results || [];

      const combined = [...movieResults, ...tvResults]
        .filter((item) => item.poster_path)
        .sort((a: MediaItem, b: MediaItem) => {
          const avgA = 'vote_average' in a ? a.vote_average : 0;
          const avgB = 'vote_average' in b ? b.vote_average : 0;
          return avgB - avgA;
        })
        .slice(0, 10);

      setItems(combined);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedGenreId, genres.length]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) {
    return (
      <section className="mb-8 py-8">
        <div className="border-b border-gray-800 pb-3 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Trends Now</h2>
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
              View All
            </Button>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-24 h-8 bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-8 bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 pb-3 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Trends Now</h2>
          <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
            View All
          </Button>
        </div>

        {/* Category Buttons */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {categoryNames.map((name, index) => (
            <button
              key={index}
              onClick={() => handleCategoryChange(index)}
              className={`relative text-sm px-4 py-2 rounded-lg font-medium transition-all
                ${
                  selectedCategory === index
                    ? 'bg-black text-white after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-red-600 after:rounded-full'
                    : 'bg-black text-gray-400 hover:text-white'
                }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Genre Buttons */}
        <div className="flex items-center justify-center gap-3 mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => handleGenreChange(0)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                selectedGenreId === 0
                  ? 'bg-red-600 text-white'
                  : 'bg-black text-gray-400 hover:text-white border border-gray-700'
              }`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreChange(genre.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  selectedGenreId === genre.id
                    ? 'bg-red-600 text-white'
                    : 'bg-black text-gray-400 hover:text-white border border-gray-700'
                }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Movies List */}
      <div className="flex overflow-x-auto space-x-8 pb-4">
        {items.map((item) => {
          const itemTitle = getItemTitle(item);
          const imagePath = item.poster_path;
          const voteAverage = 'vote_average' in item ? item.vote_average : 0;
          const itemType = getItemType(item);

          return (
            <Link
              key={item.id}
              to={`/${itemType === 'Movie' ? 'movie' : 'tv'}/${item.id}`}
              className="flex-shrink-0 w-56 group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg">
                {imagePath ? (
                  <img
                    src={imagePath}
                    alt={itemTitle}
                    className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/vite.svg';
                      (e.target as HTMLImageElement).classList.add('opacity-50');
                    }}
                  />
                ) : (
                  <div className="w-full h-72 bg-gray-700 flex items-center justify-center rounded-lg">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end p-4">
                  <div className="text-white text-base line-clamp-2 w-full">
                    {itemTitle}
                    <div className="text-gray-300 text-sm mt-1">{itemType}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-white text-lg font-medium line-clamp-1 group-hover:text-gray-300 transition-colors">
                  {itemTitle}
                </p>
                <p className="text-gray-400 text-base mt-2">
                  {voteAverage ? `${Math.round(voteAverage * 10)}%` : 'N/A'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default TrendingSection;
