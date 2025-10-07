import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { tmdbService } from "@/lib/api/TMDbServices";
import { Skeleton } from "@/components/ui/skeleton";
import MediaCard from "@/components/MediaCard";
import type { Movie, TVShow } from "@/lib/api/TMDbServices";

const ProfilePage: React.FC = () => {
  const { user, sessionId } = useAuth();
  const [ratedMoviesCount, setRatedMoviesCount] = useState<number | null>(null);
  const [ratedTVCount, setRatedTVCount] = useState<number | null>(null);
  const [favoritesCount, setFavoritesCount] = useState<number | null>(null);
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);
  const [ratedTVShows, setRatedTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !sessionId) return;

      try {
        setLoading(true);
        setError(null);

        const [ratedMoviesData, ratedTVData, favorites] = await Promise.all([
          tmdbService.getRatedMovies(user.id.toString(), sessionId),
          tmdbService.getRatedTVShows(user.id.toString(), sessionId),
          tmdbService.getFavorites(user.id.toString(), sessionId),
        ]);

        setRatedMoviesCount(ratedMoviesData.total_results);
        setRatedTVCount(ratedTVData.total_results);
        setFavoritesCount(favorites.total_results);
        setRatedMovies(ratedMoviesData.results);
        setRatedTVShows(ratedTVData.results);
      } catch (err) {
        console.error("Error fetching profile stats:", err);
        setError("Failed to load profile statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-whit  p-4">
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-6 w-64 mb-6" />
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-6 w-64 mb-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Settings</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 rounded text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-black text-white p-4 ">
      <div className="max-w-3xl mx-auto mt-20">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="flex items-center space-x-4 mb-8">
          <img
            src={
              user?.avatar?.tmdb?.avatar_path
                ? `https://image.tmdb.org/t/p/w185${user.avatar.tmdb.avatar_path}`
                : "/default-avatar.png"
            }
            alt={user?.name || ""}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold">{user?.name}</h2>
            <p className="text-gray-400">@{user?.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Rated Movies</h3>
            <p className="text-3xl font-bold">{ratedMoviesCount ?? "-"}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Rated TV Shows</h3>
            <p className="text-3xl font-bold">{ratedTVCount ?? "-"}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Favorites</h3>
            <p className="text-3xl font-bold">{favoritesCount ?? "-"}</p>
          </div>
        </div>

        {/* Rated Movies History */}
        {ratedMovies.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Rated Movies History</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {ratedMovies.map((movie) => (
                <MediaCard key={movie.id} item={movie} rating={(movie as any).rating} />
              ))}
            </div>
          </div>
        )}

        {/* Rated TV Shows History */}
        {ratedTVShows.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Rated TV Shows History</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {ratedTVShows.map((show) => (
                <MediaCard key={show.id} item={show} rating={(show as any).rating} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
