import React, { useState, useEffect } from "react";
import {
  getPopularTVShows,
  getTVByGenre,
  getMovieGenres,
} from "../lib/api/TMDbServices";
import MediaCard from "../components/MediaCard";
import SimplePagination from "../components/ui/SimplePagination";
import type { TVShow } from "../lib/api/TMDbServices";
import { useTranslation } from "react-i18next";

const TvShowPage: React.FC = () => {
  const { t } = useTranslation();
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  // 🔹 Ambil daftar genre
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getMovieGenres();
        const allowedTVGenres = [
          "Action & Adventure",
          "Animation",
          "Comedy",
          "Crime",
          "Documentary",
          "Drama",
          "Family",
          "Kids",
          "Mystery",
          "News",
          "Reality",
          "Sci-Fi & Fantasy",
          "Soap",
          "Talk",
          "War & Politics",
          "Western",
        ];
        const filtered = genresData.filter((g) =>
          allowedTVGenres.includes(g.name)
        );
        setGenres(filtered);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // 🔹 Ambil data TV Shows
  useEffect(() => {
    const fetchTVShows = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (selectedGenre) {
          data = await getTVByGenre(selectedGenre, page);
        } else {
          data = await getPopularTVShows(page);
        }
        setTvShows(data.results);
        setTotalPages(data.total_pages);
      } catch (err: any) {
        console.error(err);
        setError(t('tv.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchTVShows();
  }, [page, selectedGenre]);

  // 🔹 Loading Spinner
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="bg-black min-h-screen text-white pt-20">
      <div className="max-w-7xl mx-auto p-6">
        {/* 🔹 Judul */}
        <h1 className="text-3xl font-bold mb-6 text-red-500">
          {t('tv.popularTVShows')}
        </h1>

        {/* 🔹 Filter Genre */}
        <div className="mb-6">
          <label
            htmlFor="genre"
            className="mr-3 text-lg font-semibold text-gray-200"
          >
            {t('tv.selectGenre')}
          </label>
          <select
            id="genre"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            value={selectedGenre ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedGenre(value ? Number(value) : null);
              setPage(1);
            }}
          >
            <option value="">{t('tv.allGenres')}</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 Daftar TV Shows */}
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {tvShows.map((show) => (
            <MediaCard key={show.id} item={show} />
          ))}
        </div>

        {/* 🔹 Pagination */}
        <SimplePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default TvShowPage;
