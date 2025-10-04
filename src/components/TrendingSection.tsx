import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import type { Movie, TVShow, Genre } from '../lib/api/TMDbServices';
import { getMovieGenres, getMoviesByGenre, getPopularMovies, getPopularTVShows, getTrending, getNowPlayingMovies, getOnTheAirTV, getTVByGenre } from '../lib/api/TMDbServices';

type MediaItem = Movie | TVShow;

const TrendingSection: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0); // 0: Trending, 1: Popular, 2: Premieres
  const [selectedGenreId, setSelectedGenreId] = useState<number>(0); // 0: All, else genre ID
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi helper yang stabil
  const getItemTitle = (item: MediaItem) => 'title' in item ? item.title : item.name;
  const getItemType = (item: MediaItem) => 'title' in item ? 'Movie' : 'TV Show';
  const categoryNames = ['Trending', 'Popular', 'Premieres'];
  
  // Gunakan useCallback untuk menstabilkan handler
  const handleCategoryChange = useCallback((category: number) => {
    setSelectedCategory(category);
    setSelectedGenreId(0); // Reset to All when changing category
  }, []);

  const handleGenreChange = useCallback((genreId: number) => {
    setSelectedGenreId(genreId);
  }, []);


  // Ambil Genre (Hanya sekali saat mount)
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

  // Ambil Item Media (Dipanggil saat kategori/genre berubah)
  const fetchItems = useCallback(async () => {
    if (genres.length === 0) return;

    try {
      setLoading(true);
      const isAllGenres = selectedGenreId === 0;
      let moviePromise: Promise<any>;
      let tvPromise: Promise<any>;

      // 1. Tentukan Promise berdasarkan Kategori/Genre
      if (isAllGenres) { 
        if (selectedCategory === 0) { // Trending
          moviePromise = getTrending('movie', 'week');
          tvPromise = getTrending('tv', 'week');
        } else if (selectedCategory === 1) { // Popular
          moviePromise = getPopularMovies();
          tvPromise = getPopularTVShows();
        } else { // Premieres
          moviePromise = getNowPlayingMovies();
          tvPromise = getOnTheAirTV();
        }
      } else { 
        // Filter by genre
        moviePromise = getMoviesByGenre(selectedGenreId);
        tvPromise = getTVByGenre(selectedGenreId);
      }

      // 2. Jalankan Promise secara PARALLEL menggunakan Promise.all
      const [movieData, tvData] = await Promise.all([moviePromise, tvPromise]);
      
      // Ambil results, memastikan itu array (jika data undefined, gunakan array kosong)
      const movieResults = movieData?.results || [];
      const tvResults = tvData?.results || [];

      // Combine, filter, sort, and slice
      const combined = [
        ...movieResults,
        ...tvResults
      ].filter(item => item.poster_path) 
      .sort((a: MediaItem, b: MediaItem) => {
        const avgA = 'vote_average' in a ? a.vote_average : 0;
        const avgB = 'vote_average' in b ? b.vote_average : 0;
        return avgB - avgA;
      }).slice(0, 10);

      setItems(combined);
      
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedGenreId, genres.length]);
  
  // Panggil fetchItems saat dependensi berubah
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);


  if (loading) {
    return (
      <section className="mb-8 py-8 ">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Trends Now</h2>
          <Button variant="ghost" className="text-gray-400">View All</Button>
        </div>
        {/* Top tabs skeleton */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-28 bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>
        {/* Genre tabs skeleton */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 w-67">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>
        {/* Posters skeleton */}
        <div className="flex space-x-8 overflow-x-auto pb-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-56">
              <div className="h-72 bg-gray-700 rounded animate-pulse mb-3" />
              <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-600 rounded w-1/2 animate-pulse mt-2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Trends Now</h2>
        <Button variant="ghost" className="text-gray-400 hover:text-white">View All</Button>
      </div>

      {/* Category Tabs - Underlined centered */}
      <div className="flex justify-center space-x-12 mb-6">
        {categoryNames.map((name, index) => (
          <button
            key={index}
            className={`relative py-3 px-2 text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === index
                ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-red-600'
                : 'text-gray-400 hover:text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-transparent hover:after:bg-gray-400'
            }`}
            onClick={() => handleCategoryChange(index)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Genre Tabs - Scrollable underlined */}
      <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
        <button
          className={`relative py-2 px-1 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
            selectedGenreId === 0
              ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-600'
              : 'text-gray-400 hover:text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-transparent hover:after:bg-gray-400'
          }`}
          onClick={() => handleGenreChange(0)}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            className={`relative py-2 px-1 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
              selectedGenreId === genre.id
                ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-600'
                : 'text-gray-400 hover:text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-transparent hover:after:bg-gray-400'
            }`}
            onClick={() => handleGenreChange(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Horizontal Scrollable Posters */}
      <div className="flex overflow-x-auto space-x-8 pb-4">
        {items.map((item) => {
          const itemTitle = getItemTitle(item);
          const imagePath = item.poster_path; // Ini sudah URL lengkap dari service!
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
                    // PENTING: Cukup gunakan imagePath karena sudah URL lengkap
                    src={imagePath}
                    alt={itemTitle}
                    className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/vite.svg'; // Fallback to local placeholder
                      (e.target as HTMLImageElement).classList.add('opacity-50');
                    }}
                  />
                ) : (
                  <div className="w-full h-72 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end p-4">
                  <div className="text-white text-base line-clamp-2 w-full">
                    {itemTitle}
                    <div className="text-gray-300 text-sm mt-1">{itemType}</div>
                  </div>
                </div>
              </div>
              {/* Title and Rating */}
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