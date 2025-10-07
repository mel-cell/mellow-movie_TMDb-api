import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  addFavorite,
  getMovieAccountStates,
  getTVAccountStates,
} from "@/lib/api/TMDbServices";
import { Heart } from "lucide-react";
import type { Movie, TVShow } from "../lib/api/TMDbServices";
import { Button } from "./ui/button";

type MediaItem = Movie | TVShow;

interface MediaCardProps {
  item: MediaItem;
  className?: string;
  rank?: number;
  rating?: number;
}

const MediaCard: React.FC<MediaCardProps> = ({
  item,
  className = "",
  rank,
  rating,
}) => {
  const { user, sessionId } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isMovie = "title" in item;

  useEffect(() => {
    const fetchFavoriteState = async () => {
      if (!user || !sessionId) return;
      try {
        const states = isMovie
          ? await getMovieAccountStates(item.id, sessionId)
          : await getTVAccountStates(item.id, sessionId);
        setIsFavorite(states.favorite);
      } catch (err) {
        console.error("Error fetching favorite state:", err);
      }
    };
    fetchFavoriteState();
  }, [user, sessionId, item.id, isMovie]);
  const title = isMovie ? item.title : item.name;
  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
  const type = isMovie ? "movie" : "tv";
  const imageUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !sessionId) {
      alert("You must login first to use this function.");
      navigate("/login");
      return;
    }
    setFavoriteLoading(true);
    try {
      await addFavorite(
        user.id.toString(),
        sessionId,
        item.id,
        type,
        !isFavorite
      );
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Link
      to={`/${type}/${item.id}`}
      className={`relative group rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-zinc-900 shadow-lg hover:shadow-xl ${className}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity duration-300"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-gray-700">
          <span className="text-sm text-gray-400">No Image</span>
        </div>
      )}

      {/* Rank number in top right corner */}
      {rank && (
        <div className="absolute top-2 right-10 bg-red-600 text-white text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10">
          {rank}
        </div>
      )}

      {/* Rating badge */}
      {rating && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg z-10">
          {rating}
        </div>
      )}

      {/* Favorite button */}
      <Button
        onClick={handleFavoriteToggle}
        disabled={favoriteLoading}
        className={`absolute ${
          rank ? "top-2 left-2" : "top-2 left-2"
        }  bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10`}
      >
        <Heart
          className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
        />
      </Button>

      {/* Hover overlay with info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white text-lg font-semibold line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">{year}</span>
          <span className="text-yellow-400 font-medium">
            ⭐ {item.vote_average.toFixed(1)}
          </span>
        </div>
        <div className="text-gray-400 text-xs mt-1 capitalize">{type}</div>
      </div>
    </Link>
  );
};

export default MediaCard;
