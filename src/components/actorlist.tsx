import React, { useEffect, useState } from 'react';
import type { Credit } from '../lib/api/TMDbServices';
import { tmdbService } from '../lib/api/TMDbServices';

interface ActorListProps {
  movieId: number; // ID of the movie or TV show to fetch actors for
  isTVShow?: boolean; // Flag to indicate if the ID is for a TV show
}

const ActorList: React.FC<ActorListProps> = ({ movieId, isTVShow = false }) => {
  const [actors, setActors] = useState<Credit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActors = async () => {
      setLoading(true);
      setError(null);
      try {
        let credits;
        if (isTVShow) {
          credits = await tmdbService.getTVCredits(movieId);
        } else {
          credits = await tmdbService.getMovieCredits(movieId);
        }
        setActors(credits.cast);
      } catch (err) {
        setError('Failed to load actors.');
      } finally {
        setLoading(false);
      }
    };

    fetchActors();
  }, [movieId, isTVShow]);

  if (loading) {
    return <div>Loading actors...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (actors.length === 0) {
    return <div>No actors found.</div>;
  }

  return (
    <div className="actor-list grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {actors.map((actor) => (
        <div key={actor.id} className="actor-card bg-white rounded shadow p-2 flex flex-col items-center">
          {actor.profile_path ? (
            <img
              src={actor.profile_path}
              alt={actor.name}
              className="w-24 h-32 object-cover rounded mb-2"
            />
          ) : (
            <div className="w-24 h-32 bg-gray-300 flex items-center justify-center rounded mb-2">
              No Image
            </div>
          )}
          <h3 className="text-sm font-semibold text-center">{actor.name}</h3>
          <p className="text-xs text-gray-600 text-center">{actor.character}</p>
        </div>
      ))}
    </div>
  );
};

export default ActorList;
