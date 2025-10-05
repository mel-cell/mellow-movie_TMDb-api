import React, { useEffect, useState } from "react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type { Movie, TVShow } from "@/lib/api/TMDbServices";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import MediaCard from "@/components/MediaCard";

const MainPage: React.FC = () => {
  const [trendingAll, setTrendingAll] = useState<(Movie | TVShow)[]>([]);
  const [heroItem, setHeroItem] = useState<Movie | TVShow | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [movieData, tvData] = await Promise.all([
          tmdbService.getTrending("movie", "day"),
          tmdbService.getTrending("tv", "day"),
        ]);

        const combined = [
          ...(movieData.results || []),
          ...(tvData.results || []),
        ]
          .filter((item) => item.poster_path)
          .sort((a, b) => b.vote_average - a.vote_average)
          .slice(0, 20); // limit to 20

        if (combined.length > 0) {
          setTrendingAll(combined);

          // pilih 1 item acak buat hero section
          const random = combined[Math.floor(Math.random() * combined.length)];
          setHeroItem(random);
        }
      } catch (error) {
        console.error("Error fetching trending data:", error);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 🧭 Hero Section */}
      {heroItem && (
        <HeroSection heroMovie={heroItem} heroTrailer={null} heroCast={[]} />
      )}

      {/* 🔥 Trending Section */}
      <div className="max-w-screen-2xl mx-auto px-5 py-10">
        <h1 className="text-4xl font-extrabold text-red-500 mb-8">
          Trending Now
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {trendingAll.map((item) => (
            <MediaCard key={item.id} item={item} className="h-80" />
          ))}
        </div>
      </div>

      {/* Optional: bisa tambahin rekomendasi / trailer di bawah */}
    </div>
  );
};

export default MainPage;
