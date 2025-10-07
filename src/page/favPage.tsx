import React, { useState, useEffect, Suspense, lazy } from "react";
const Button = lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })));
const Skeleton = lazy(() => import("@/components/ui/skeleton").then(mod => ({ default: mod.Skeleton })));
const Input = lazy(() => import("@/components/ui/input").then(mod => ({ default: mod.Input })));
import { tmdbService } from "@/lib/api/TMDbServices";
import type { Movie, TVShow } from "@/lib/api/TMDbServices";
import { useAuth } from "@/contexts/AuthContext";
const MediaCard = lazy(() => import("@/components/MediaCard"));

type FavoriteItem = (Movie | TVShow) & { mediaType: "movie" | "tv" };

const FavPage: React.FC = () => {
  const { user, sessionId } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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


  const filteredFavorites = favorites.filter((item) => {
    const title = 'title' in item ? item.title : item.name;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <h1 className="text-3xl font-bold mb-4">My Favorites</h1>
        <Suspense fallback={<div>Loading skeletons...</div>}>
          <Skeleton className="h-64 bg-gray-800" />
          <Skeleton className="h-64 bg-gray-800" />
          <Skeleton className="h-64 bg-gray-800" />
        </Suspense>
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
        <Suspense fallback={<div>Loading input...</div>}>
          <Input
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mb-4"
          />
        </Suspense>
        {filteredFavorites.length === 0 ? (
          <p className="text-gray-400">
            {favorites.length === 0
              ? "You haven't added any favorites yet."
              : "No favorites match your search."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFavorites.map((item) => (
              <MediaCard key={item.id} item={item} className="hover:scale-100" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavPage;
