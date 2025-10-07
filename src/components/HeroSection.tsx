import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Play, Plus, VolumeX, Volume } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Movie, TVShow, Video } from "../lib/api/TMDbServices";

interface HeroSectionProps {
  heroMovie: Movie | TVShow | null;
  heroTrailer: Video | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  heroMovie,
  heroTrailer,
}) => {
  const { t } = useTranslation();

  const [isMuted, setIsMuted] = useState(true);
  const [runtime, setRuntime] = useState<string>(""); // ✅ state untuk durasi tayang
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // ✅ Ambil runtime film dari TMDb API berdasarkan heroMovie.id
  useEffect(() => {
    const fetchRuntime = async () => {
      if (!heroMovie) return;

      const isMovie = "title" in heroMovie;
      const type = isMovie ? "movie" : "tv";
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${type}/${heroMovie.id}?api_key=${apiKey}&language=en-US`
        );
        const data = await res.json();

        // Movie: pakai data.runtime
        // TV: pakai data.episode_run_time (array)
        let minutes = 0;
        if (isMovie && data.runtime) {
          minutes = data.runtime;
        } else if (!isMovie && data.episode_run_time?.length > 0) {
          minutes = data.episode_run_time[0];
        }

        if (minutes > 0) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          setRuntime(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
        } else {
          setRuntime("N/A");
        }
      } catch (error) {
        console.error("Gagal mengambil runtime:", error);
        setRuntime("N/A");
      }
    };

    fetchRuntime();
  }, [heroMovie]);

  // ✅ Update mute/unmute pada iframe
  useEffect(() => {
    if (iframeRef.current && heroTrailer) {
      const src = `https://www.youtube.com/embed/${
        heroTrailer.key
      }?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${
        heroTrailer.key
      }&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${
        window.location.origin
      }`;
      iframeRef.current.src = src;
    }
  }, [isMuted, heroTrailer]);

  if (!heroMovie) return null;

  const isMovie = "title" in heroMovie;
  const title = isMovie ? heroMovie.title : heroMovie.name;
  const releaseDate = isMovie
    ? heroMovie.release_date
    : heroMovie.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : "";
  const rating = Math.round(heroMovie.vote_average * 10);

  return (
    <section className="relative h-screen w-screen bg-black overflow-hidden">
      {/* Trailer Background */}
      {heroTrailer && (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            id="hero-video-player"
            className="absolute inset-0 w-[110%] h-[110%] sm:w-[120%] sm:h-[120%] md:w-[130%] md:h-[130%] object-cover -top-[55px] sm:-top-[60px] md:-top-[65px] -left-[27.5px] sm:-left-[30px] md:-left-[32.5px] scale-[1.05] sm:scale-[1.1] md:scale-[1.15] transform"
            src={`https://www.youtube.com/embed/${heroTrailer.key}?autoplay=1&mute=1&controls=0&playlist=${heroTrailer.key}&modestbranding=1&rel=0`}
            title="Trailer Background"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          ></iframe>

        </div>
      )}

      {!heroTrailer && heroMovie.backdrop_path && (
        <div
          className="absolute inset-0 w-screen h-screen bg-cover bg-center"
          style={{ backgroundImage: `url(${heroMovie.backdrop_path})` }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />

      {/* Main content */}
      <div className="relative flex items-center h-full pt-16 px-4 sm:pt-20 sm:px-8 md:px-16 lg:pt-20 lg:pl-32 lg:pr-8">
        <div className="text-left text-white max-w-4xl animate-fade-in w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{title}</h1>

          {/* Metadata */}
          {releaseYear && (
            <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mb-4 text-sm text-gray-300">
              <span>{releaseYear}</span>
              <span>•</span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-1"></span>
                {rating}%
              </span>
              <span>•</span>
              {/* ✅ durasi tayang asli */}
              <span>{runtime || "Loading..."}</span>
            </div>
          )}

          <p className="text-base sm:text-lg mb-6 line-clamp-2 opacity-90 max-w-2xl">
            {heroMovie.overview}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white text-base sm:text-lg px-6 sm:px-12 py-2 sm:py-3 rounded-full font-semibold shadow-lg w-full sm:w-auto"
                >
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {t("hero.play")}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full h-full max-w-none p-0">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${
                    heroTrailer?.key || ""
                  }?autoplay=1`}
                  title={heroTrailer?.name || "Trailer"}
                  allowFullScreen
                ></iframe>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              className="text-white bg-transparent text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-black hover:bg-opacity-10 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {t("hero.myList")}
            </Button>
            <Button
              onClick={toggleMute}
              className="p-2 sm:p-3 rounded-full bg-none border-white text-white hover:bg-black/70 transition z-50 w-auto"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Volume className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 h-[20%] bg-gradient-to-b from-transparent via-black/80 to-black"></div>
    </section>
  );
};

export default HeroSection;
