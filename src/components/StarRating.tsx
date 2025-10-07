import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number | null;
  onRatingChange: (rating: number) => void;
  maxStars?: number;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  maxStars = 5,
  disabled = false,
}) => {
  const handleStarClick = (starValue: number) => {
    if (disabled) return;
    onRatingChange(starValue);
  };

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = rating !== null && starValue <= rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starValue)}
            disabled={disabled}
            className={`bg-transparent border-none p-0 transition-colors ${
              disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
            }`}
          >
            <Star
              className={`w-6 h-6 ${
                isFilled
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-400 hover:text-yellow-300"
              }`}
            />
          </button>
        );
      })}
      {rating && (
        <span className="ml-2 text-yellow-500 font-semibold">
          {rating * 2}/10
        </span>
      )}
    </div>
  );
};

export default StarRating;
