import React, { useEffect, useState } from "react";
import {
  getPopularMovies,
  getMovieGenres,
  getMoviesByGenre,
} from "../lib/api/TMDbServices";
import type { Movie } from "../lib/api/TMDbServices";
import MediaCard from "../components/MediaCard";
import SimplePagination from "../components/ui/SimplePagination";

const MoviePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  // 🔹 Ambil daftar genre dari TMDb
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getMovieGenres();
        setGenres(genresData);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);
  // 🔹 Ambil semua film populer / berdasarkan genre
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (selectedGenre) {
          data = await getMoviesByGenre(selectedGenre, page);
          setMovies(data.results);
          setTotalPages(data.total_pages);
        } else {
          // Load multiple pages for popular movies to show more
          const pagesToLoad = [page, page + 1, page + 2].filter(
            (p) => p <= 500
          ); // TMDB max 500 pages
          const promises = pagesToLoad.map((p) => getPopularMovies(p));
          const results = await Promise.all(promises);
          const allMovies = results.flatMap((result) => result.results);
          setMovies(allMovies);
          setTotalPages(results[0].total_pages);
        }
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat data film");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [page, selectedGenre]);

  // 🔹 Loading spinner
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );

  // 🔹 Error handler
  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="bg-black min-h-screen text-white pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-red-500">Popular Movies</h1>

        {/* 🔹 FILTER GENRE */}
        <div className="mb-6">
          <label
            htmlFor="genre"
            className="mr-3 text-lg font-semibold text-gray-200"
          >
            Pilih Genre:
          </label>
          <select
            id="genre"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            value={selectedGenre ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedGenre(value ? Number(value) : null);
              setPage(1); // reset ke halaman pertama
            }}
          >
            <option value="">Semua Genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 GRID MOVIES */}
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie) => (
            <MediaCard key={movie.id} item={movie} />
          ))}
        </div>

        {/* 🔹 PAGINATION */}
        <SimplePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default MoviePage;
