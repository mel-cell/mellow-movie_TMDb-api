import React, { useState, useEffect } from "react";
import { getPopularTVShows } from "../lib/api/TMDbServices";
import SimplePagination from "../components/ui/SimplePagination";

import type { TVShow } from "../lib/api/TMDbServices";

const TvShowPage: React.FC = () => {
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true); // ✅ fix
  const [error, setError] = useState<string | null>(null); // optional

  useEffect(() => {
    const fetchTVShows = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPopularTVShows(page);
        setTvShows(data.results);
        setTotalPages(data.total_pages);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat TV Shows");
      } finally {
        setLoading(false);
      }
    };
    fetchTVShows();
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-white p-6 pt-24">
      {/* Judul Page */}
      <h1 className="text-3xl font-bold mb-6 text-gray-100 tracking-wide">
        Discover TV Shows
      </h1>

      {/* Loading & Error */}
      {loading ? (
        <p className="text-gray-400">Loading TV shows...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tvShows.map((show) => (
            <a
              key={show.id}
              href={`/tv/${show.id}`}
              className="relative group overflow-hidden rounded-xl bg-zinc-900 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {show.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.name}
                  className="w-full h-auto object-cover group-hover:opacity-90"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-700">
                  <span className="text-sm text-gray-400">No Image</span>
                </div>
              )}

              {/* Info */}
              <div className="p-3 bg-zinc-950/70 backdrop-blur-sm">
                <h2 className="text-base font-semibold truncate text-gray-100">
                  {show.name}
                </h2>
                <p className="text-sm text-gray-400">
                  {show.first_air_date
                    ? new Date(show.first_air_date).getFullYear()
                    : "N/A"}
                </p>
                <p className="text-yellow-400 text-sm font-medium">
                  ⭐ {show.vote_average.toFixed(1)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 space-x-4">
        
      </div>

      <SimplePagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default TvShowPage;
