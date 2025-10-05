import React, { useEffect, useReducer } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Heart, ChevronDown } from "lucide-react";
import {
  tmdbService,
  addFavorite,
  addMovieRating,
  addTVRating,
  getSimilarMovies,
  getSimilarTVShows,
} from "@/lib/api/TMDbServices";
import type {
  MovieDetail,
  TVDetail,
  Video,
  Credit,
  Movie,
  TVShow,
} from "@/lib/api/TMDbServices";
import { useAuth } from "@/contexts/AuthContext";
import MediaCard from "@/components/MediaCard";

interface DetailState {
  details: MovieDetail | TVDetail | null;
  videos: Video[];
  credits: { cast: Credit[] } | null;
  similar: (Movie | TVShow)[];
  loading: boolean;
  error: string | null;
  userRating: number | null;
  isFavorite: boolean;
  ratingLoading: boolean;
  favoriteLoading: boolean;
  expandedSeason: number | null;
  episodesMap: Map<number, any[]>;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: { details: MovieDetail | TVDetail; videos: Video[]; credits: { cast: Credit[] }; similar: (Movie | TVShow)[] } }
  | { type: 'SET_USER_DATA'; payload: { userRating: number | null; isFavorite: boolean } }
  | { type: 'SET_RATING_LOADING'; payload: boolean }
  | { type: 'SET_FAVORITE_LOADING'; payload: boolean }
  | { type: 'SET_USER_RATING'; payload: number | null }
  | { type: 'SET_IS_FAVORITE'; payload: boolean }
  | { type: 'SET_EXPANDED_SEASON'; payload: number | null }
  | { type: 'ADD_EPISODES'; payload: { seasonNumber: number; episodes: any[] } };

const initialState: DetailState = {
  details: null,
  videos: [],
  credits: null,
  similar: [],
  loading: true,
  error: null,
  userRating: null,
  isFavorite: false,
  ratingLoading: false,
  favoriteLoading: false,
  expandedSeason: null,
  episodesMap: new Map(),
};

const reducer = (state: DetailState, action: Action): DetailState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_DATA':
      return { ...state, ...action.payload, loading: false, error: null };
    case 'SET_USER_DATA':
      return { ...state, ...action.payload };
    case 'SET_RATING_LOADING':
      return { ...state, ratingLoading: action.payload };
    case 'SET_FAVORITE_LOADING':
      return { ...state, favoriteLoading: action.payload };
    case 'SET_USER_RATING':
      return { ...state, userRating: action.payload };
    case 'SET_IS_FAVORITE':
      return { ...state, isFavorite: action.payload };
    case 'SET_EXPANDED_SEASON':
      return { ...state, expandedSeason: action.payload };
    case 'ADD_EPISODES':
      return { ...state, episodesMap: new Map(state.episodesMap).set(action.payload.seasonNumber, action.payload.episodes) };
    default:
      return state;
  }
};

const DetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const type = location.pathname.startsWith("/movie") ? "movie" : "tv";
  const [state, dispatch] = useReducer(reducer, initialState);

  const { user, sessionId } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const itemId = parseInt(id);
        let detailsData: MovieDetail | TVDetail;
        let videosData: Video[];
        let creditsData: { cast: Credit[] };
        let similarData: (Movie | TVShow)[];

        if (type === "movie") {
          [detailsData, videosData, creditsData, similarData] =
            await Promise.all([
              tmdbService.getMovieDetails(itemId),
              tmdbService.getMovieVideos(itemId),
              tmdbService.getMovieCredits(itemId),
              getSimilarMovies(itemId).then((data) =>
                data.results.slice(0, 10)
              ),
            ]);
        } else {
          [detailsData, videosData, creditsData, similarData] =
            await Promise.all([
              tmdbService.getTVDetails(itemId),
              tmdbService.getTVVideos(itemId),
              tmdbService.getTVCredits(itemId),
              getSimilarTVShows(itemId).then((data) =>
                data.results.slice(0, 10)
              ),
            ]);
        }

        dispatch({ type: 'SET_DATA', payload: { details: detailsData, videos: videosData, credits: creditsData, similar: similarData } });

        // Fetch user rating and favorite status if logged in
        if (user && sessionId) {
          try {
            const [ratedData, favoritesData] = await Promise.all([
              type === "movie"
                ? tmdbService.getRatedMovies(user.id.toString(), sessionId)
                : tmdbService.getRatedTVShows(user.id.toString(), sessionId),
              tmdbService.getFavorites(user.id.toString(), sessionId),
            ]);

            const ratedItem = ratedData.results.find(
              (item) => item.id === itemId
            );
            if (ratedItem) {
              // Assuming rated items have rating, but TMDB rated list may not include rating value
              // For now, set to null, as API doesn't provide the rating value in list
              dispatch({ type: 'SET_USER_RATING', payload: null }); // TMDB doesn't provide rating value in rated list
            }

            const favoriteItem = favoritesData.results.find(
              (item) => item.id === itemId
            );
            dispatch({ type: 'SET_IS_FAVORITE', payload: !!favoriteItem });
          } catch (err) {
            console.error("Error fetching user status:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
        dispatch({ type: 'SET_ERROR', payload: "Failed to load details. Please try again." });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchData();
  }, [type, id]);

  const handleRatingChange = async (newRating: number) => {
    if (!user || !sessionId || !state.details) return;
    dispatch({ type: 'SET_RATING_LOADING', payload: true });
    try {
      if (type === "movie") {
        await addMovieRating(state.details.id, newRating, sessionId);
      } else {
        await addTVRating(state.details.id, newRating, sessionId);
      }
      dispatch({ type: 'SET_USER_RATING', payload: newRating });
    } catch (err) {
      console.error("Error submitting rating:", err);
    } finally {
      dispatch({ type: 'SET_RATING_LOADING', payload: false });
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user || !sessionId || !state.details) return;
    dispatch({ type: 'SET_FAVORITE_LOADING', payload: true });
    try {
      await addFavorite(
        user.id.toString(),
        sessionId,
        state.details.id,
        type,
        !state.isFavorite
      );
      dispatch({ type: 'SET_IS_FAVORITE', payload: !state.isFavorite });
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      dispatch({ type: 'SET_FAVORITE_LOADING', payload: false });
    }
  };

  const toggleSeason = async (seasonNumber: number) => {
    if (!state.details) return;
    if (state.expandedSeason === seasonNumber) {
      dispatch({ type: 'SET_EXPANDED_SEASON', payload: null });
      return;
    }
    if (!state.episodesMap.has(seasonNumber)) {
      try {
        const seasonData = await tmdbService.getTVSeasonDetails(
          state.details.id,
          seasonNumber
        );
        dispatch({ type: 'ADD_EPISODES', payload: { seasonNumber, episodes: seasonData.episodes || [] } });
      } catch (err) {
        console.error("Error fetching season details:", err);
      }
    }
    dispatch({ type: 'SET_EXPANDED_SEASON', payload: seasonNumber });
  };

  if (state.loading) {
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

  if (state.error || !state.details) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('detail.error')}</h1>
          <p className="text-gray-400 mb-6">{state.error || t('detail.itemNotFound')}</p>
          <Link to="/">
            <Button variant="outline" className="text-white border-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('detail.backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = "title" in state.details ? state.details.title : state.details.name;
  const releaseDate =
    "release_date" in state.details ? state.details.release_date : state.details.first_air_date;
  const runtime = "runtime" in state.details ? state.details.runtime : null;
  const numberOfSeasons =
    "number_of_seasons" in state.details ? state.details.number_of_seasons : null;
  const numberOfEpisodes =
    "number_of_episodes" in state.details ? state.details.number_of_episodes : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Backdrop */}
      <div className="relative">
        {state.details.backdrop_path ? (
          <img
            src={state.details.backdrop_path}
            alt={title}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gray-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute left-4 md:left-20 top-4">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white bg-black/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('detail.back')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="">
            <div className="flex-shrink-0 max-w-80 mx-auto md:mx-0">
              {state.details.poster_path ? (
                <img
                  src={state.details.poster_path}
                  alt={title}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>

            {/* Seasons and Episodes for TV Shows */}
            {type === "tv" &&
              "seasons" in state.details &&
              state.details.seasons &&
              state.details.seasons.length > 0 && (
                <div className="mb-8 max-w-80 mt-10 ">
                  <h2 className="text-2xl font-semibold mb-4">{t('detail.seasons')}</h2>
                  <div className="space-y-4 h-96 overflow-y-auto pr-2">
                    {state.details.seasons.map((season) => (
                      <div key={season.id}>
                        <Card
                          className="bg-gray-800 border-gray-700 cursor-pointer"
                          onClick={() => toggleSeason(season.season_number)}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-4 items-center">
                              {season.poster_path ? (
                                <img
                                  src={season.poster_path}
                                  alt={season.name}
                                  className="w-20 h-30 object-cover rounded"
                                />
                              ) : (
                                <div className="w-20 h-30 bg-gray-700 rounded flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">
                                    No Image
                                  </span>
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-base">
                                  {season.name}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {season.episode_count} {season.episode_count !== 1 ? t('detail.episodes') : t('detail.episode')}
                                </p>
                                {season.air_date && (
                                  <p className="text-sm text-gray-400">
                                    {new Date(season.air_date).getFullYear()}
                                  </p>
                                )}
                                {season.overview && (
                                  <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                                    {season.overview}
                                  </p>
                                )}
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 transition-transform ${
                                  state.expandedSeason === season.season_number
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </div>
                          </CardContent>
                        </Card>
                        {state.expandedSeason === season.season_number &&
                          state.episodesMap.has(season.season_number) && (
                            <div className="mt-4 ml-4 max-h-96 overflow-y-auto space-y-2">
                              {state.episodesMap
                                .get(season.season_number)!
                                .map((episode) => (
                                  <Card
                                    key={episode.id}
                                    className="bg-gray-800 border-gray-700 max-w-md"
                                  >
                                    <CardContent className="p-3">
                                      <div className="flex gap-3">
                                        {episode.still_path ? (
                                          <img
                                            src={episode.still_path}
                                            alt={episode.name}
                                            className="w-16 h-12 object-cover rounded"
                                          />
                                        ) : (
                                          <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center">
                                            <span className="text-gray-500 text-xs">
                                              No Image
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-sm">
                                            {episode.episode_number}.{" "}
                                            {episode.name}
                                          </h4>
                                          {episode.air_date && (
                                            <p className="text-xs text-gray-400">
                                              {episode.air_date}
                                            </p>
                                          )}
                                          {episode.overview && (
                                            <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                                              {episode.overview}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{title}</h1>
            {state.details.tagline && (
              <p className="text-xl text-gray-300 italic mb-4">
                "{state.details.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">
                  {state.details.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-400">
                  ({state.details.vote_count} votes)
                </span>
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
                  <span>
                    {numberOfSeasons} season{numberOfSeasons !== 1 ? "s" : ""}
                  </span>
                </>
              )}
              {numberOfEpisodes && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>
                    {numberOfEpisodes} episode
                    {numberOfEpisodes !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {state.details.genres.map((genre: any) => (
                <Badge
                  key={genre.id}
                  variant="secondary"
                  className="bg-red-600 text-white"
                >
                  {genre.name}
                </Badge>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('detail.overview')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {state.details.overview}
              </p>
            </div>

            {/* Rating and Favorite */}
            {user && sessionId && (
              <div className="mb-8 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <label htmlFor="rating" className="text-white font-semibold">
                    {t('detail.yourRating')}
                  </label>
                  <select
                    id="rating"
                    value={state.userRating ?? ""}
                    onChange={(e) => handleRatingChange(Number(e.target.value))}
                    disabled={state.ratingLoading}
                    className="bg-gray-800 text-white rounded px-3 py-1 border border-gray-600"
                  >
                    <option value="">{t('detail.rateThis')} {type}</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  {state.userRating && (
                    <span className="text-yellow-500 font-semibold">
                      {state.userRating}/10
                    </span>
                  )}
                </div>
                <Button
                  variant={state.isFavorite ? "destructive" : "default"}
                  onClick={handleFavoriteToggle}
                  disabled={state.favoriteLoading}
                  className="flex items-center gap-2"
                >
                  <Heart
                    className={`w-4 h-4 ${state.isFavorite ? "fill-current" : ""}`}
                  />
                  {state.isFavorite ? t('detail.removeFromFavorites') : t('detail.addToFavorites')}
                </Button>
              </div>
            )}

            {/* Videos */}
            {state.videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t('detail.videos')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.videos.slice(0, 4).map((video: any) => (
                    <Card
                      key={video.id}
                      className="bg-gray-800 border-gray-700"
                    >
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
            {state.credits && state.credits.cast.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t('detail.cast')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {state.credits.cast.slice(0, 12).map((actor: any) => (
                    <div key={actor.id} className="text-center">
                      {actor.profile_path ? (
                        <img
                          src={actor.profile_path}
                          alt={actor.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">
                            No Image
                          </span>
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
              {"original_title" in state.details &&
                state.details.original_title !== state.details.title && (
                  <div>
                    <h3 className="font-semibold mb-1">{t('detail.originalTitle')}</h3>
                    <p className="text-gray-300">{state.details.original_title}</p>
                  </div>
                )}
              {"original_name" in state.details &&
                state.details.original_name !== state.details.name && (
                  <div>
                    <h3 className="font-semibold mb-1">{t('detail.originalName')}</h3>
                    <p className="text-gray-300">{state.details.original_name}</p>
                  </div>
                )}
              <div>
                <h3 className="font-semibold mb-1">{t('detail.status')}</h3>
                <p className="text-gray-300">{state.details.status}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('detail.language')}</h3>
                <p className="text-gray-300">
                  {state.details.original_language.toUpperCase()}
                </p>
              </div>
              {"budget" in state.details && state.details.budget > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">{t('detail.budget')}</h3>
                  <p className="text-gray-300">
                    ${state.details.budget.toLocaleString()}
                  </p>
                </div>
              )}
              {"revenue" in state.details && state.details.revenue > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">{t('detail.revenue')}</h3>
                  <p className="text-gray-300">
                    ${state.details.revenue.toLocaleString()}
                  </p>
                </div>
              )}
              {state.details.homepage && (
                <div>
                  <h3 className="font-semibold mb-1">{t('detail.homepage')}</h3>
                  <a
                    href={state.details.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {t('detail.visitWebsite')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Similar Movies/TV Shows */}
        {state.similar.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {type === "movie" ? t('detail.similarMovies') : t('detail.similarTVShows')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {state.similar.map((item: any) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPage;
