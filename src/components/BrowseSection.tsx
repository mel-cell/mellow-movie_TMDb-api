import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type {
  Movie,
  TVShow,
  Genre,
  SearchResult,
} from "@/lib/api/TMDbServices";
import MediaCard from "./MediaCard";
import SimplePagination from "@/components/ui/SimplePagination";

interface BrowseSectionProps {}

const BrowseSection: React.FC<BrowseSectionProps> = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [category, setCategory] = useState<"movie" | "tv" | "original">(
    "movie"
  );
  const [year, setYear] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<
    "title.asc" | "title.desc" | "vote_average.desc"
  >("vote_average.desc");
  const [minRating, setMinRating] = useState<number>(0);
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const movieGenres = await tmdbService.getMovieGenres();
        setGenres(movieGenres); // Use movie genres for both, as TV genres are similar
      } catch (error) {
        console.error("Error fetching genres:", error);
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
          if (category === "tv" || category === "original") {
            data = await tmdbService.searchTVShows(searchQuery, currentPage);
          } else {
            data = await tmdbService.searchMovies(searchQuery, currentPage);
          }
        } else {
          const params: Record<string, any> = {
            page: currentPage,
          };

          if (selectedGenres.length > 0) {
            params.with_genres = selectedGenres.join(",");
          }
          params.sort_by = sortBy;
          if (minRating > 0) {
            params["vote_average.gte"] = minRating;
          }
          if (year) {
            if (category === "tv" || category === "original") {
              params.first_air_date_year = year;
            } else {
              params.primary_release_year = year;
            }
          }
          if (category === "original") {
            params.origin_country = "US";
          }

          console.log("Fetching results with params:", params);

          if (category === "tv" || category === "original") {
            data = await tmdbService.discoverTV(params);
          } else {
            data = await tmdbService.discoverMovies(params);
          }
        }

        console.log('Results length before filtering:', data.results.length);
        if (data.results.length > 0) {
          console.log('First result vote_average before filtering:', data.results[0].vote_average);
        }

        // Apply client-side rating filter if minRating > 0
        let filteredResults = data.results;
        if (minRating > 0) {
          filteredResults = data.results.filter(item => item.vote_average >= minRating);
        }

        console.log('Results length after filtering:', filteredResults.length);
        if (filteredResults.length > 0) {
          console.log('First result vote_average after filtering:', filteredResults[0].vote_average);
        }

        setResults(filteredResults);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error("Error fetching results:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [
    category,
    selectedGenres,
    year,
    sortBy,
    minRating,
    currentPage,
    searchQuery,
  ]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setYear(null);
    setMinRating(0);
    setSortBy("vote_average.desc");
    setCurrentPage(1);
    setSearchQuery("");
    setSearchInput("");
  };

  const years = Array.from(
    { length: new Date().getFullYear() - 1900 + 1 },
    (_, i) => 1900 + i
  ).reverse();

  return (
    <div className="py-8 bg-black">
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Category Tabs */}
        <Tabs
          value={category}
          onValueChange={(value) => {
            setCategory(value as "movie" | "tv" | "original");
            setCurrentPage(1);
            setSearchQuery("");
            setSearchInput("");
          }}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-black border border-gray-700 rounded-lg">
            <TabsTrigger
              value="movie"
              className="text-white data-[state=active]:text-white data-[state=active]:bg-red-600"
            >
              Movies
            </TabsTrigger>
            <TabsTrigger
              value="tv"
              className="text-white data-[state=active]:text-white data-[state=active]:bg-red-600"
            >
              TV Shows
            </TabsTrigger>
            <TabsTrigger
              value="original"
              className="text-white data-[state=active]:text-white data-[state=active]:bg-red-600"
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
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search movies, TV shows..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput);
                    setCurrentPage(1);
                  }
                }}
                className="pl-10 pr-12 bg-gray-800 border-gray-600 text-white rounded-full w-full md:w-64"
              />
              <Button
                onClick={() => {
                  setSearchQuery(searchInput);
                  setCurrentPage(1);
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 h-6 w-6"
              >
                <Search className="w-3 h-3" />
              </Button>
            </div>
            <Select value={sortBy} onValueChange={setSortBy as any}>
              <SelectTrigger className="w-full md:w-32 bg-gray-800 border-gray-600 text-white rounded-full">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
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
              <SelectTrigger className="w-full md:w-32 bg-gray-800 border-gray-600 text-white rounded-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="all">All Years</SelectItem>
                {years
                  .slice(-20)
                  .reverse()
                  .map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Rating</span>
              <div className="bg-gray-700 rounded-full p-2 border-2 border-gray-500">
                <Slider
                  value={[minRating]}
                  onValueChange={(value) => {
                    console.log("Slider value changed to:", value[0]);
                    setMinRating(value[0]);
                  }}
                  max={10}
                  step={0.5}
                  className="w-32 md:w-48 [&_[role=slider]]:bg-red-600 [&_[role=slider]]:border-red-600 [&_.relative]:bg-white [&_.relative]:border-2 [&_.relative]:border-gray-400 [&_.absolute]:bg-red-600"
                />
              </div>
              <span className="text-white text-sm">
                {minRating.toFixed(1)}+{" "}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="text-white border-foreground rounded-full px-4 py-2"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Results */}
        {searchQuery && (
          <p className="text-gray-400 text-sm mb-4">
            Note: Filters (genres, year, rating) are not applied to search
            results.
          </p>
        )}
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
            No results found. Try adjusting filters or search query.
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
