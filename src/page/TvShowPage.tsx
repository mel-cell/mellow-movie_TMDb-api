import { useState, useEffect } from "react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type { TVShow, SearchResult } from "@/lib/api/TMDbServices";

const TvShowPage: React.FC = () => {
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTv = async () => {
      try {
        setLoading(true);
        const data: SearchResult<TVShow> = await tmdbService.discoverTV({ page });
        setTvShows(data.results);
        setTotalPages(data.total_pages);
      } catch (err) {
        console.error("Error fetch TV Shows:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTv();
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-white p-6 pt-24">
      {/* Judul Page */}
      <h1 className="text-3xl font-bold mb-6 text-gray-100 tracking-wide">
        Discover TV Shows
      </h1>

      {/* Loading State */}
      {loading ? (
        <p className="text-gray-400">Loading TV shows...</p>
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

              {/* Info mirip Home */}
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
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded bg-zinc-800 text-gray-200 hover:bg-zinc-700 disabled:opacity-50"
        >
          Previous
        </button>

        <span className="px-4 py-2 font-medium text-gray-300">
          {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded bg-zinc-800 text-gray-200 hover:bg-zinc-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TvShowPage;
