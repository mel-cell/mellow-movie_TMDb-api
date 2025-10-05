import { useState, useEffect } from "react";
import { tmdbService } from "@/lib/api/TMDbServices";
import type { Movie, Video } from "@/lib/api/TMDbServices";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import BrowseSection from "@/components/BrowseSection";
import VideoPlayRecommended from "@/components/videoPlayrecomended";
import ActorList from "@/components/actorlist";

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


  // fetch data
  useEffect(() => {
    const fetchData = async () => {
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
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
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
