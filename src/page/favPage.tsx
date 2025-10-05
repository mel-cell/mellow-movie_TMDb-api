import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, X } from "lucide-react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type { Movie, TVShow } from "@/lib/api/TMDbServices";
import { useAuth } from "@/contexts/AuthContext";
import MediaCard from "@/components/MediaCard";

type FavoriteItem = (Movie | TVShow) & { mediaType: "movie" | "tv" };

const FavPage: React.FC = () => {
  const { user, sessionId } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !sessionId) return;

      try {
        setLoading(true);
        setError(null);

        const [movieFavorites, tvFavorites] = await Promise.all([
          tmdbService.getFavorites(user.id.toString(), sessionId),
          tmdbService.getFavoriteTVShows(user.id.toString(), sessionId),
        ]);

        const combined: FavoriteItem[] = [
          ...movieFavorites.results.map((item) => ({
            ...item,
            mediaType: "movie" as const,
          })),
          ...tvFavorites.results.map((item) => ({
            ...item,
            mediaType: "tv" as const,
          })),
        ];

        setFavorites(combined);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Failed to load favorites. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, sessionId]);

  const removeFavorite = async (item: FavoriteItem) => {
    if (!user || !sessionId) return;

    try {
      await tmdbService.addFavorite(
        user.id.toString(),
        sessionId,
        item.id,
        item.mediaType,
        false
      );
      setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
    } catch (err) {
      console.error("Error removing favorite:", err);
      setError("Failed to remove favorite. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <h1 className="text-3xl font-bold mb-4">My Favorites</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-64 bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">My Favorites</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto mt-20">
        <h1 className="text-3xl font-bold mb-4">My Favorites</h1>
        {favorites.length === 0 ? (
          <p className="text-gray-400">You haven't added any favorites yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favorites.map((item) => (
              <div key={item.id} className="relative group">
                <MediaCard item={item} />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFavorite(item as any)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavPage;
