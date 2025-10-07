import { useState, useEffect } from "react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type { Movie, Video, Credit } from "@/lib/api/TMDbServices";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import BrowseSection from "@/components/BrowseSection";
import VideoPlayRecommended from "@/components/videoPlayrecomended";
import ActorList from "@/components/actorlist";

const HomePage: React.FC = () => {
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [heroTrailer, setHeroTrailer] = useState<Video | null>(null);
  const [heroCast, setHeroCast] = useState<Credit[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // default dark

  // 🔹 Sync theme with document
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  // 🔹 Apply theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // fetch data
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trendingMovieData = await tmdbService.getTrending("movie", "day");

        if (trendingMovieData.results.length > 0) {
          setTrendingMovies(trendingMovieData.results as Movie[]);

          const firstMovie = trendingMovieData.results[0] as Movie;
          setHeroMovie(firstMovie);

          const videos = await tmdbService.getMovieVideos(firstMovie.id);
          setHeroTrailer(videos[0] || null);

          const credits = await tmdbService.getMovieCredits(firstMovie.id);
          setHeroCast(credits.cast.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // 🔁 Ganti trailer otomatis setiap 15 detik
  useEffect(() => {
    if (trendingMovies.length === 0) return;

    const interval = setInterval(async () => {
      const nextIndex = (currentIndex + 1) % trendingMovies.length;
      setCurrentIndex(nextIndex);

      const nextMovie = trendingMovies[nextIndex];
      setHeroMovie(nextMovie);

      const videos = await tmdbService.getMovieVideos(nextMovie.id);
      setHeroTrailer(videos[0] || null);

      const credits = await tmdbService.getMovieCredits(nextMovie.id);
      setHeroCast(credits.cast.slice(0, 4));
    }, 25000); // untuk pembatas durasi film

    return () => clearInterval(interval);
  }, [currentIndex, trendingMovies]);

  // apply theme

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      {/* Toggle Theme Button */}
      <div className="absolute top-5 right-5 z-50"></div>

      {/* Hero Section */}
      <HeroSection
        heroMovie={heroMovie}
        heroTrailer={heroTrailer}
        heroCast={heroCast}
      />

      {/* Trending Section */}
      <div className="max-w-screen-2xl mx-auto p-5">
        <TrendingSection />
      </div>

      {/* Video Recommended */}
      <div className="max-w-screen-2xl mx-auto p-5">
        <BrowseSection />
      </div>

      <div className="max-w-screen-2xl mx-auto p-5">
        {heroMovie && <VideoPlayRecommended movieId={heroMovie.id} />}
      </div>

      <div className="max-w-screen-2xl mx-auto p-5">
        {heroMovie && <ActorList movieId={heroMovie.id} />}
      </div>
    </div>
  );
};

export default HomePage;
