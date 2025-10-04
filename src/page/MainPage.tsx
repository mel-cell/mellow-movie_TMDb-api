import React, { useEffect, useState } from 'react';
import { tmdbService } from '@/lib/api/TMDbServices';
import type { Movie, TVShow } from '@/lib/api/TMDbServices';
import HeroSection from '@/components/HeroSection';
import TrendingSection from '@/components/TrendingSection';

const MainPage: React.FC = () => {
  const [trendingAll, setTrendingAll] = useState<(Movie | TVShow)[]>([]);
  const [heroItem, setHeroItem] = useState<Movie | TVShow | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // ambil data dari /trending/all/day
        const trendingData = await tmdbService.getTrending('all', 'day');

        if (trendingData.results.length > 0) {
          setTrendingAll(trendingData.results);

          // pilih 1 item acak buat hero section
          const random = trendingData.results[
            Math.floor(Math.random() * trendingData.results.length)
          ];
          setHeroItem(random);
        }
      } catch (error) {
        console.error('Error fetching trending data:', error);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 🧭 Hero Section */}
      {heroItem && (
        <HeroSection
          heroMovie={heroItem as Movie}
          heroTrailer={null}
          heroCast={[]}
        />
      )}

      {/* 🔥 Trending Section */}
      <div className="max-w-screen-2xl mx-auto px-5 py-10">
        <h1 className="text-4xl font-extrabold text-red-500 mb-8">
          🔥 Trending Now
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {trendingAll.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
            >
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={"title" in item ? item.title : (item as TVShow).name}
                  className="w-full h-72 object-cover"
                />
              ) : (
                <div className="w-full h-72 bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
              <div className="p-3 text-center">
                <h3 className="text-sm font-semibold truncate">
                  {"title" in item ? item.title : (item as TVShow).name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 uppercase">
                  {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional: bisa tambahin rekomendasi / trailer di bawah */}
    </div>
  );
};

export default MainPage;
