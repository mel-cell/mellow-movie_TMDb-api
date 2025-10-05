import { useState, useEffect, Suspense, lazy } from "react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type { Movie, Video } from "@/lib/api/TMDbServices";
import HeroSection from "@/components/HeroSection";

// Lazy load components that are below the fold
const TrendingSection = lazy(() => import("@/components/TrendingSection"));
const BrowseSection = lazy(() => import("@/components/BrowseSection"));
const VideoPlayRecommended = lazy(() => import("@/components/videoPlayrecomended"));
const ActorList = lazy(() => import("@/components/actorlist"));

const HomePage: React.FC = () => {
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [heroTrailer, setHeroTrailer] = useState<Video | null>(null);
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


  // fetch hero movie and trailer data only initially
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const trendingMovieData = await tmdbService.getTrending("movie", "day");

        if (trendingMovieData.results.length > 0) {
          const randomMovie = trendingMovieData.results[
            Math.floor(Math.random() * trendingMovieData.results.length)
          ] as Movie;
          setHeroMovie(randomMovie);

          const videos = await tmdbService.getMovieVideos(randomMovie.id);
          setHeroTrailer(videos[0] || null);
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);
      }
    };
    fetchHeroData();
  }, []);

  // lazy load other data after initial render
  useEffect(() => {
    const lazyLoadData = async () => {
      // You can implement lazy data fetching here for TrendingSection, BrowseSection, etc.
      // For example, you can trigger events or state updates to fetch data inside those components lazily
    };

    // Delay lazy loading to after initial render
    const timer = setTimeout(() => {
      lazyLoadData();
    }, 3000); // 3 seconds delay, adjust as needed

    return () => clearTimeout(timer);
  }, []);

  // apply theme

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection
        heroMovie={heroMovie}
        heroTrailer={heroTrailer}
      />

      {/* Trending Section */}
      <div className="max-w-screen-2xl mx-auto p-5">
        <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded"></div>}>
          <TrendingSection />
        </Suspense>
      </div>

      {/* Browse Section */}
      <div className="max-w-screen-2xl mx-auto p-5">
        <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded"></div>}>
          <BrowseSection />
        </Suspense>
      </div>

      {/* Video Recommended */}
      <div className="max-w-screen-2xl mx-auto p-5">
        {heroMovie && (
          <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded"></div>}>
            <VideoPlayRecommended movieId={heroMovie.id} />
          </Suspense>
        )}
      </div>

      {/* Actor List */}
      <div className="max-w-screen-2xl mx-auto p-5">
        {heroMovie && (
          <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded"></div>}>
            <ActorList movieId={heroMovie.id} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default HomePage;
