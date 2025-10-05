import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, ArrowLeft, Star, Heart } from 'lucide-react';
import { tmdbService, addFavorite, addMovieRating, addTVRating, getSimilarMovies, getSimilarTVShows } from '@/lib/api/TMDbServices';
import type { MovieDetail, TVDetail, Video, Credit, Movie, TVShow } from '@/lib/api/TMDbServices';
import { useAuth } from '@/contexts/AuthContext';
import MediaCard from '@/components/MediaCard';

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const type = location.pathname.startsWith('/movie') ? 'movie' : 'tv';
  const [details, setDetails] = useState<MovieDetail | TVDetail | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [credits, setCredits] = useState<{ cast: Credit[] } | null>(null);
  const [similar, setSimilar] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, sessionId } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const itemId = parseInt(id);
        let detailsData: MovieDetail | TVDetail;
        let videosData: Video[];
        let creditsData: { cast: Credit[] };
        let similarData: (Movie | TVShow)[];

        if (type === 'movie') {
          [detailsData, videosData, creditsData, similarData] = await Promise.all([
            tmdbService.getMovieDetails(itemId),
            tmdbService.getMovieVideos(itemId),
            tmdbService.getMovieCredits(itemId),
            getSimilarMovies(itemId).then(data => data.results.slice(0, 10)),
          ]);
        } else {
          [detailsData, videosData, creditsData, similarData] = await Promise.all([
            tmdbService.getTVDetails(itemId),
            tmdbService.getTVVideos(itemId),
            tmdbService.getTVCredits(itemId),
            getSimilarTVShows(itemId).then(data => data.results.slice(0, 10)),
          ]);
        }

        setDetails(detailsData);
        setVideos(videosData);
        setCredits(creditsData);
        setSimilar(similarData);

        // Fetch user rating and favorite status if logged in
        if (user && sessionId) {
          try {
            const [ratedData, favoritesData] = await Promise.all([
              type === 'movie' ? tmdbService.getRatedMovies(user.id.toString(), sessionId) : tmdbService.getRatedTVShows(user.id.toString(), sessionId),
              tmdbService.getFavorites(user.id.toString(), sessionId)
            ]);

            const ratedItem = ratedData.results.find(item => item.id === itemId);
            if (ratedItem) {
              // Assuming rated items have rating, but TMDB rated list may not include rating value
              // For now, set to null, as API doesn't provide the rating value in list
              setUserRating(null); // TMDB doesn't provide rating value in rated list
            }

            const favoriteItem = favoritesData.results.find(item => item.id === itemId);
            setIsFavorite(!!favoriteItem);
          } catch (err) {
            console.error('Error fetching user status:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Failed to load details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  const handleRatingChange = async (newRating: number) => {
    if (!user || !sessionId || !details) return;
    setRatingLoading(true);
    try {
      if (type === 'movie') {
        await addMovieRating(details.id, newRating, sessionId);
      } else {
        await addTVRating(details.id, newRating, sessionId);
      }
      setUserRating(newRating);
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user || !sessionId || !details) return;
    setFavoriteLoading(true);
    try {
      await addFavorite(user.id.toString(), sessionId, details.id, type, !isFavorite);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white w-screen ">
        <div className="relative">
          <Skeleton className="w-full h-96 bg-gray-800" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-80 h-120 bg-gray-800 rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4 bg-gray-800" />
              <Skeleton className="h-6 w-1/2 bg-gray-800" />
              <Skeleton className="h-4 w-full bg-gray-800" />
              <Skeleton className="h-4 w-full bg-gray-800" />
              <Skeleton className="h-4 w-3/4 bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error || 'Item not found'}</p>
          <Link to="/">
            <Button variant="outline" className="text-white border-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = 'title' in details ? details.title : details.name;
  const releaseDate = 'release_date' in details ? details.release_date : details.first_air_date;
  const runtime = 'runtime' in details ? details.runtime : null;
  const numberOfSeasons = 'number_of_seasons' in details ? details.number_of_seasons : null;
  const numberOfEpisodes = 'number_of_episodes' in details ? details.number_of_episodes : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Backdrop */}
      <div className="relative">
        {details.backdrop_path ? (
          <img
            src={details.backdrop_path}
            alt={title}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gray-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute left-20">
          <Link to="/">
            <Button variant="outline" size="sm" className="text-white border-white bg-black/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            {details.poster_path ? (
              <img
                src={details.poster_path}
                alt={title}
                className="w-80 h-120 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-80 h-120 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            {details.tagline && (
              <p className="text-xl text-gray-300 italic mb-4">"{details.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">{details.vote_average.toFixed(1)}</span>
                <span className="text-gray-400">({details.vote_count} votes)</span>
              </div>
              <span className="text-gray-400">•</span>
              <span>{new Date(releaseDate).getFullYear()}</span>
              {runtime && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{runtime} min</span>
                </>
              )}
              {numberOfSeasons && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{numberOfSeasons} season{numberOfSeasons !== 1 ? 's' : ''}</span>
                </>
              )}
              {numberOfEpisodes && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{numberOfEpisodes} episode{numberOfEpisodes !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {details.genres.map((genre) => (
                <Badge key={genre.id} variant="secondary" className="bg-red-600 text-white">
                  {genre.name}
                </Badge>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{details.overview}</p>
            </div>

            {/* Rating and Favorite */}
            {user && sessionId && (
              <div className="mb-8 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <label htmlFor="rating" className="text-white font-semibold">
                    Your Rating:
                  </label>
                  <select
                    id="rating"
                    value={userRating ?? ''}
                    onChange={(e) => handleRatingChange(Number(e.target.value))}
                    disabled={ratingLoading}
                    className="bg-gray-800 text-white rounded px-3 py-1 border border-gray-600"
                  >
                    <option value="">Rate this {type}</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  {userRating && (
                    <span className="text-yellow-500 font-semibold">{userRating}/10</span>
                  )}
                </div>
                <Button
                  variant={isFavorite ? 'destructive' : 'default'}
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className="flex items-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.slice(0, 4).map((video) => (
                    <Card key={video.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="aspect-video mb-2">
                          <iframe
                            src={`https://www.youtube.com/embed/${video.key}`}
                            title={video.name}
                            className="w-full h-full rounded"
                            allowFullScreen
                          />
                        </div>
                        <p className="text-sm text-gray-300">{video.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Cast */}
            {credits && credits.cast.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {credits.cast.slice(0, 12).map((actor) => (
                    <div key={actor.id} className="text-center">
                      {actor.profile_path ? (
                        <img
                          src={actor.profile_path}
                          alt={actor.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                      <p className="text-sm font-medium">{actor.name}</p>
                      <p className="text-xs text-gray-400">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {'original_title' in details && details.original_title !== details.title && (
                <div>
                  <h3 className="font-semibold mb-1">Original Title</h3>
                  <p className="text-gray-300">{details.original_title}</p>
                </div>
              )}
              {'original_name' in details && details.original_name !== details.name && (
                <div>
                  <h3 className="font-semibold mb-1">Original Name</h3>
                  <p className="text-gray-300">{details.original_name}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-1">Status</h3>
                <p className="text-gray-300">{details.status}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Language</h3>
                <p className="text-gray-300">{details.original_language.toUpperCase()}</p>
              </div>
              {'budget' in details && details.budget > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">Budget</h3>
                  <p className="text-gray-300">${details.budget.toLocaleString()}</p>
                </div>
              )}
              {'revenue' in details && details.revenue > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">Revenue</h3>
                  <p className="text-gray-300">${details.revenue.toLocaleString()}</p>
                </div>
              )}
              {details.homepage && (
                <div>
                  <h3 className="font-semibold mb-1">Homepage</h3>
                  <a
                    href={details.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            {/* Similar Movies/TV Shows */}
            {similar.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Similar {type === 'movie' ? 'Movies' : 'TV Shows'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {similar.map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
