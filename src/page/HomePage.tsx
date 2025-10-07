import { useState, useEffect, Suspense, lazy } from "react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type { Movie, Video } from "@/lib/api/TMDbServices";
import HeroSection from "@/components/HeroSection";

// Komponen di bawah dimuat secara lazy agar performa halaman lebih cepat
const TrendingSection = lazy(() => import("@/components/TrendingSection"));
const BrowseSection = lazy(() => import("@/components/BrowseSection"));
const VideoPlayRecommended = lazy(
  () => import("@/components/videoPlayrecomended")
);
const ActorList = lazy(() => import("@/components/actorlist"));

const HomePage: React.FC = () => {
  // State utama
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [heroTrailer, setHeroTrailer] = useState<Video | null>(null);

  // Tema (gelap / terang)
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Cek tema saat pertama render
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  // Terapkan tema ke dokumen
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Ambil tema tersimpan di localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // ==============================================================
  // Ambil data film trending + trailer
  // ==============================================================

  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const trendingMovieData = await tmdbService.getTrending("movie", "day");

        if (trendingMovieData.results.length > 0) {
          const movies = trendingMovieData.results as Movie[];
          setTrendingMovies(movies);

          // Pilih film acak untuk ditampilkan pertama kali
          const randomMovie = movies[Math.floor(Math.random() * movies.length)];
          setHeroMovie(randomMovie);

          // Ambil trailer film pertama
          const videos = await tmdbService.getMovieVideos(randomMovie.id);
          setHeroTrailer(videos[0] || null);
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);
      }
    };
    fetchHeroData();
  }, []);

  // ==============================================================
  // 🔁 Ganti trailer otomatis tiap 15 detik
  // ==============================================================
  useEffect(() => {
    if (trendingMovies.length === 0) return;

    const interval = setInterval(async () => {
      const nextIndex = (currentIndex + 1) % trendingMovies.length;
      setCurrentIndex(nextIndex);

      const nextMovie = trendingMovies[nextIndex];
      setHeroMovie(nextMovie);

      const videos = await tmdbService.getMovieVideos(nextMovie.id);
      setHeroTrailer(videos[0] || null);
    }, 15000); // setiap 15 detik

    return () => clearInterval(interval);
  }, [currentIndex, trendingMovies]);

  // ==============================================================
  // 🔹 Lazy load tambahan (dipanggil setelah 3 detik)
  // ==============================================================
  useEffect(() => {
    const lazyLoadData = async () => {
      // Bisa dipakai untuk load data tambahan nanti
    };

    const timer = setTimeout(() => {
      lazyLoadData();
    }, 3000); // delay 3 detik

    return () => clearTimeout(timer);
  }, []);

  // ==============================================================
  // 🔹 Tampilan halaman
  // ==============================================================
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Bagian Hero */}
      <HeroSection heroMovie={heroMovie} heroTrailer={heroTrailer} />

      {/* Bagian Trending */}
      <div className="max-w-7xl mx-auto">
        <div className="max-w-screen p-5">
          <Suspense
            fallback={
              <div className="h-64 bg-gray-800 animate-pulse rounded"></div>
            }
          >
            <TrendingSection />
          </Suspense>
        </div>

        {/* Bagian Browse */}
        <div className="max-w-screen-2xl mx-auto p-5">
          <Suspense
            fallback={
              <div className="h-64 bg-gray-800 animate-pulse rounded"></div>
            }
          >
            <BrowseSection />
          </Suspense>
        </div>

        {/* Bagian Video Recommended */}
        <div className="max-w-screen-2xl mx-auto p-5">
          {heroMovie && (
            <Suspense
              fallback={
                <div className="h-64 bg-gray-800 animate-pulse rounded"></div>
              }
            >
              <VideoPlayRecommended movieId={heroMovie.id} />
            </Suspense>
          )}
        </div>

        {/* Bagian Actor List */}
        <div className="max-w-screen-2xl mx-auto p-5">
          {heroMovie && (
            <Suspense
              fallback={
                <div className="h-64 bg-gray-800 animate-pulse rounded"></div>
              }
            >
              <ActorList movieId={heroMovie.id} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
