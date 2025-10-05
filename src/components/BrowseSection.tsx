import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { tmdbService } from '@/lib/api/TMDbServices';
import type { Movie, TVShow, Genre, SearchResult } from '@/lib/api/TMDbServices';
import MediaCard from './MediaCard';
import SimplePagination from '@/components/ui/SimplePagination';

interface BrowseSectionProps {}

const BrowseSection: React.FC<BrowseSectionProps> = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [category, setCategory] = useState<'movie' | 'tv' | 'original'>('movie');
  const [year, setYear] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'title.asc' | 'title.desc' | 'vote_average.desc'>('vote_average.desc');
  const [minRating, setMinRating] = useState<number>(0);
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const movieGenres = await tmdbService.getMovieGenres();
        setGenres(movieGenres); // Use movie genres for both, as TV genres are similar
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let data: SearchResult<Movie | TVShow>;
        if (searchQuery.trim()) {
          if (category === 'tv' || category === 'original') {
            data = await tmdbService.searchTVShows(searchQuery, currentPage);
          } else {
            data = await tmdbService.searchMovies(searchQuery, currentPage);
          }
        } else {
          const params: Record<string, any> = {
            page: currentPage,
          };

          if (selectedGenres.length > 0) {
            params.with_genres = selectedGenres.join(',');
          }
          params.sort_by = sortBy;
          if (minRating > 0) {
            params['vote_average.gte'] = minRating;
          }
          if (year) {
            if (category === 'tv' || category === 'original') {
              params.first_air_date_year = year;
            } else {
              params.primary_release_year = year;
            }
          }
          if (category === 'original') {
            params.origin_country = 'US';
          }

          if (category === 'tv' || category === 'original') {
            data = await tmdbService.discoverTV(params);
          } else {
            data = await tmdbService.discoverMovies(params);
          }
        }

        setResults(data.results);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error('Error fetching results:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [category, selectedGenres, year, sortBy, minRating, currentPage, searchQuery]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev =>
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setYear(null);
    setMinRating(0);
    setSortBy('vote_average.desc');
    setCurrentPage(1);
    setSearchQuery('');
    setSearchInput('');
  };

  const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i).reverse();

  return (
    <div className="py-8 bg-black">
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Category Tabs */}
        <Tabs
          value={category}
          onValueChange={(value) =>
            setCategory(value as "movie" | "tv" | "original")
          }
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger
              value="movie"
              className="data-[state=active]:bg-red-600"
            >
              Movies
            </TabsTrigger>
            <TabsTrigger value="tv" className="data-[state=active]:bg-red-600">
              TV Shows
            </TabsTrigger>
            <TabsTrigger
              value="original"
              className="data-[state=active]:bg-red-600"
            >
              Original Series
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Horizontal Genre Buttons */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {genres.map((genre) => (
            <Button
              key={genre.id}
              variant={
                selectedGenres.includes(genre.id) ? "default" : "outline"
              }
              className={`rounded-full px-4 py-2 ${
                selectedGenres.includes(genre.id)
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
              }`}
              onClick={() => toggleGenre(genre.id)}
            >
              {genre.name}
            </Button>
          ))}
        </div>

        {/* Bottom Horizontal Filters */}
        <div className="flex items-center justify-between mb-6 space-x-4">
          <div className="flex space-x-4">
            <Select value={sortBy} onValueChange={setSortBy as any}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white rounded-full">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
                <SelectItem value="title.asc">A-Z</SelectItem>
                <SelectItem value="title.desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={year?.toString() || "all"}
              onValueChange={(value) =>
                setYear(value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white rounded-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years
                  .slice(-10)
                  .reverse()
                  .map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">Rating</span>
            <Slider
              value={[minRating]}
              onValueChange={(value) => setMinRating(value[0])}
              max={10}
              step={0.5}
              className="w-48"
              // ✅ Tambahan styling untuk track dan range supaya terlihat
              style={{
                background: "linear-gradient(to right, #dc2626, #f87171)",
                height: "6px",
                borderRadius: "9999px",
              }}
            />
            <span className="text-white text-sm">{minRating.toFixed(1)}+</span>
          </div>

          <Button
            variant="outline"
            onClick={clearFilters}
            className="text-white border-white rounded-full px-4 py-2"
          >
            Clear
          </Button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full">
                <div className="h-72 bg-gray-700 rounded-lg animate-pulse mb-3" />
                <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-600 rounded w-1/2 animate-pulse mt-2" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            No results found. Try adjusting filters.
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default BrowseSection;
