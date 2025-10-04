import { useState, useEffect } from "react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type { TVShow, SearchResult } from "@/lib/api/TMDbServices";
import MediaCard from "@/components/MediaCard";

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
      <h1 className="text-3xl font-bold mb-6 text-gray-100 tracking-wide ">
        Discover TV Shows
      </h1>

      {/* Loading State */}
      {loading ? (
        <p className="text-gray-400">Loading TV shows...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
          {tvShows.map((show) => (
            <MediaCard key={show.id} item={show} />
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
