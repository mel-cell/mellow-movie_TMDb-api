import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Film, Tv, Crown } from "lucide-react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type {
  Movie,
  TVShow,
  Genre,
  SearchResult,
} from "@/lib/api/TMDbServices";
import MediaCard from "./MediaCard";
import StarRating from "./StarRating";
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
    "highest_rated" | "a_z" | "z_a" | "newest" | "oldest"
  >("highest_rated");
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
          let sortParam = "vote_average.desc";
          switch (sortBy) {
            case "highest_rated":
              sortParam = "vote_average.desc";
              break;
            case "a_z":
              sortParam = "title.asc";
              break;
            case "z_a":
              sortParam = "title.desc";
              break;
            case "newest":
              sortParam = category === "tv" || category === "original" ? "first_air_date.desc" : "release_date.desc";
              break;
            case "oldest":
              sortParam = category === "tv" || category === "original" ? "first_air_date.asc" : "release_date.asc";
              break;
          }
          params.sort_by = sortParam;
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

        console.log("Results length before filtering:", data.results.length);
        if (data.results.length > 0) {
          console.log(
            "First result vote_average before filtering:",
            data.results[0].vote_average
          );
        }

        // Apply client-side rating filter if minRating > 0
        let filteredResults = data.results;
        if (minRating > 0) {
          filteredResults = data.results.filter(
            (item) => item.vote_average >= minRating
          );
        }

        console.log("Results length after filtering:", filteredResults.length);
        if (filteredResults.length > 0) {
          console.log(
            "First result vote_average after filtering:",
            filteredResults[0].vote_average
          );
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
    setSortBy("highest_rated");
    setCurrentPage(1);
    setSearchQuery("");
    setSearchInput("");
  };

  const years = Array.from(
    { length: 2025 - 1900 + 1 },
    (_, i) => 2025 - i
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
          <TabsList className="grid w-full grid-cols-3 bg-none gap-3 p-0">
            <TabsTrigger
              value="movie"
              className="
      flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-800 text-white text-lg sm:text-xl transition-all duration-300
      data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:text-xl sm:data-[state=active]:text-2xl data-[state=active]:font-bold
      hover:bg-gray-700
    "
            >
              <Film className="w-4 h-4 sm:w-5 sm:h-5 data-[state=active]:w-6 sm:data-[state=active]:w-8 data-[state=active]:h-6 sm:data-[state=active]:h-8" />
              <span className="hidden sm:inline">Movies</span>
              <span className="sm:hidden">Movie</span>
            </TabsTrigger>
            <TabsTrigger
              value="tv"
              className="
      flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-800 text-white text-lg sm:text-xl transition-all duration-300
      data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:text-xl sm:data-[state=active]:text-2xl data-[state=active]:font-bold
      hover:bg-gray-700
    "
            >
              <Tv className="w-4 h-4 sm:w-5 sm:h-5 data-[state=active]:w-6 sm:data-[state=active]:w-8 data-[state=active]:h-6 sm:data-[state=active]:h-8" />
              <span className="hidden sm:inline">TV Shows</span>
              <span className="sm:hidden">TV</span>
            </TabsTrigger>
            <TabsTrigger
              value="original"
              className="
      flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-800 text-white text-lg sm:text-xl transition-all duration-300
      data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:text-xl sm:data-[state=active]:text-2xl data-[state=active]:font-bold
      hover:bg-gray-700
    "
            >
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 data-[state=active]:w-6 sm:data-[state=active]:w-8 data-[state=active]:h-6 sm:data-[state=active]:h-8" />
              <span className="hidden sm:inline">Original Series</span>
              <span className="sm:hidden">Original</span>
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
              className={`rounded-full px-3 sm:px-4 py-2 text-sm sm:text-base ${
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
              <SelectTrigger className="w-full md:w-32 bg-gray-800 border-gray-600 text-white rounded-full text-sm sm:text-base">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="highest_rated">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="a_z">A-Z</SelectItem>
                <SelectItem value="z_a">Z-A</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={year?.toString() || "all"}
              onValueChange={(value) =>
                setYear(value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger className="w-full md:w-32 bg-gray-800 border-gray-600 text-white rounded-full text-sm sm:text-base">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="all">All Years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Min Rating</span>
              <StarRating
                rating={minRating === 0 ? null : Math.round(minRating / 2)}
                onRatingChange={(starRating) => setMinRating(starRating * 2)}
                disabled={false}
              />
              <Button
                variant="outline"
                onClick={() => setMinRating(0)}
                className={`rounded-full px-3 py-1 text-sm ${
                  minRating === 0
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                }`}
              >
                All
              </Button>
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
