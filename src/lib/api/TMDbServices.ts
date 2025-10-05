/// <reference types="vite/client" />

import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Pastikan IMAGE_BASE_URL memiliki garis miring di akhir untuk konsistensi
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p"; // Tanpa '/' di akhir

// Types for TMDb responses (simplified)
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface MovieDetail extends Movie {
  adult: boolean;
  belongs_to_collection: any;
  budget: number;
  genres: Genre[];
  homepage: string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  popularity: number;
  production_companies: any[];
  production_countries: any[];
  revenue: number;
  runtime: number;
  spoken_languages: any[];
  status: string;
  tagline: string;
  video: boolean;
  vote_count: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TVDetail extends TVShow {
  adult: boolean;
  created_by: any[];
  episode_run_time: number[];
  genres: Genre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: any;
  next_episode_to_air: any;
  networks: any[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  popularity: number;
  production_companies: any[];
  production_countries: any[];
  seasons: any[];
  spoken_languages: any[];
  status: string;
  tagline: string;
  type: string;
  vote_count: number;
}

// tipe untuk Favorite Response
export interface FavoriteResult {
  success: boolean;
  status_code: number;
  status_message: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Credit {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface SearchResult<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface DeleteRatingResult {
  success: boolean;
  status_code: number;
  status_message: string;
}

export interface RatingResult {
  success: boolean;
  status_code: number;
  status_message: string;
}

export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface MultiSearchResult {
  page: number;
  results: (Movie | TVShow | Credit)[];
  total_pages: number;
  total_results: number;
}

class TMDbService {
  private apiKey: string;

  constructor() {
    if (!TMDB_API_KEY) {
      throw new Error("VITE_TMDB_API_KEY is required in .env.local");
    }
    this.apiKey = TMDB_API_KEY;
  }

  private async request(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append("api_key", this.apiKey);
    url.searchParams.append("language", "en-US"); // Default language

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await axios.get(url.toString());
      return response.data;
    } catch (error: any) {
      throw new Error(
        `TMDb API error: ${error.response?.status} ${error.response?.statusText}`
      );
    }
  }

  private async post(
    endpoint: string,
    body: Record<string, any>,
    params: Record<string, any> = {}
  ) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append("api_key", this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await axios.post(url.toString(), body, {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        `TMDb API error: ${error.response?.status} ${error.response?.statusText}`
      );
    }
  }

  // Similar Movies
  async getSimilarMovies(
    movieId: number,
    page: number = 1
  ): Promise<SearchResult<Movie>> {
    const data = await this.request(`/movie/${movieId}/similar`, { page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Similar TV Shows
  async getSimilarTVShows(
    tvId: number,
    page: number = 1
  ): Promise<SearchResult<TVShow>> {
    const data = await this.request(`/tv/${tvId}/similar`, { page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Rating methods
  async addMovieRating(
    movieId: number,
    rating: number,
    sessionId: string
  ): Promise<RatingResult> {
    return this.post(
      `/movie/${movieId}/rating`,
      { value: rating },
      { session_id: sessionId }
    );
  }

  async addTVRating(
    tvId: number,
    rating: number,
    sessionId: string
  ): Promise<RatingResult> {
    return this.post(
      `/tv/${tvId}/rating`,
      { value: rating },
      { session_id: sessionId }
    );
  }

  async deleteMovieRating(
    movieId: number,
    sessionId: string
  ): Promise<DeleteRatingResult> {
    const url = new URL(`${TMDB_BASE_URL}/movie/${movieId}/rating`);
    url.searchParams.append("api_key", this.apiKey);
    url.searchParams.append("session_id", sessionId);

    try {
      const response = await axios.delete(url.toString());
      return response.data;
    } catch (error: any) {
      throw new Error(
        `TMDb API error: ${error.response?.status} ${error.response?.statusText}`
      );
    }
  }

  async deleteTVRating(
    tvId: number,
    sessionId: string
  ): Promise<DeleteRatingResult> {
    const url = new URL(`${TMDB_BASE_URL}/tv/${tvId}/rating`);
    url.searchParams.append("api_key", this.apiKey);
    url.searchParams.append("session_id", sessionId);

    try {
      const response = await axios.delete(url.toString());
      return response.data;
    } catch (error: any) {
      throw new Error(
        `TMDb API error: ${error.response?.status} ${error.response?.statusText}`
      );
    }
  }

  async getRatedMovies(
    accountId: string,
    sessionId: string,
    page: number = 1
  ): Promise<SearchResult<Movie>> {
    const data = await this.request(`/account/${accountId}/rated/movies`, {
      session_id: sessionId,
      page,
    });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async getRatedTVShows(
    accountId: string,
    sessionId: string,
    page: number = 1
  ): Promise<SearchResult<TVShow>> {
    const data = await this.request(`/account/${accountId}/rated/tv`, {
      session_id: sessionId,
      page,
    });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Perbaikan: Fungsi Helper untuk memetakan path gambar menjadi URL lengkap
  private mapImagePaths(results: any[]): any[] {
    const IMAGE_SIZE_POSTER = "w500";
    const IMAGE_SIZE_BACKDROP = "original";
    const IMAGE_SIZE_PROFILE = "w500"; // Untuk aktor

    return results.map((item) => {
      // Gabungkan Base URL, Ukuran, dan Path. Tambahkan '/' setelah IMAGE_BASE_URL
      if (item.poster_path)
        item.poster_path = `${IMAGE_BASE_URL}/${IMAGE_SIZE_POSTER}${item.poster_path}`;
      if (item.backdrop_path)
        item.backdrop_path = `${IMAGE_BASE_URL}/${IMAGE_SIZE_BACKDROP}${item.backdrop_path}`;
      if (item.profile_path)
        item.profile_path = `${IMAGE_BASE_URL}/${IMAGE_SIZE_PROFILE}${item.profile_path}`;
      return item;
    });
  }

  // =================================================================
  // FUNCTIONS DENGAN LOGIKA PEMETAAN YANG SUDAH DI-REFACTOR
  // =================================================================

  // Trending
  async getTrending(
    mediaType: "movie" | "tv" | "person",
    timeWindow: "day" | "week" = "day"
  ): Promise<SearchResult<Movie | TVShow>> {
    const data = await this.request(`/trending/${mediaType}/${timeWindow}`);
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Popular
  async getPopularMovies(page: number = 1): Promise<SearchResult<Movie>> {
    const data = await this.request("/movie/popular", { page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async getPopularTVShows(page: number = 1): Promise<SearchResult<TVShow>> {
    const data = await this.request("/tv/popular", { page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Genres
  async getMovieGenres(): Promise<Genre[]> {
    const data = await this.request("/genre/movie/list");
    return data.genres;
  }

  // Discover by Genre
  async getMoviesByGenre(
    genreId: number,
    page: number = 1
  ): Promise<SearchResult<Movie>> {
    const data = await this.request("/discover/movie", {
      with_genres: genreId,
      page,
    });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async getTVByGenre(
    genreId: number,
    page: number = 1
  ): Promise<SearchResult<TVShow>> {
    const data = await this.request("/discover/tv", {
      with_genres: genreId,
      page,
    });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Premieres / Now Playing
  async getNowPlayingMovies(page: number = 1): Promise<SearchResult<Movie>> {
    const data = await this.request("/movie/now_playing", { page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async getOnTheAirTV(page: number = 1): Promise<SearchResult<TVShow>> {
    const data = await this.request("/tv/on_the_air", { page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Movie details
  async getMovieDetails(movieId: number): Promise<MovieDetail> {
    const data = await this.request(`/movie/${movieId}`);
    return this.mapImagePaths([data])[0];
  }

  async getMovieVideos(movieId: number): Promise<Video[]> {
    const data = await this.request(`/movie/${movieId}/videos`);
    return data.results.filter((video: Video) => video.site === "YouTube");
  }

  async getMovieCredits(movieId: number): Promise<{ cast: Credit[] }> {
    const data = await this.request(`/movie/${movieId}/credits`);
    data.cast = this.mapImagePaths(data.cast);
    return data;
  }

  // TV details
  async getTVDetails(tvId: number): Promise<TVDetail> {
    const data = await this.request(`/tv/${tvId}`);
    return this.mapImagePaths([data])[0];
  }

  async getTVVideos(tvId: number): Promise<Video[]> {
    const data = await this.request(`/tv/${tvId}/videos`);
    return data.results.filter((video: Video) => video.site === "YouTube");
  }

  async getTVCredits(tvId: number): Promise<{ cast: Credit[] }> {
    const data = await this.request(`/tv/${tvId}/credits`);
    data.cast = this.mapImagePaths(data.cast);
    return data;
  }

  // Get TV Season Details
  async getTVSeasonDetails(tvId: number, seasonNumber: number): Promise<any> {
    const data = await this.request(`/tv/${tvId}/season/${seasonNumber}`);
    if (data.episodes) {
      data.episodes = data.episodes.map((episode: any) => {
        if (episode.still_path) {
          episode.still_path = `${IMAGE_BASE_URL}/w300${episode.still_path}`;
        }
        return episode;
      });
    }
    return data;
  }

  // Search
  async searchMovies(
    query: string,
    page: number = 1
  ): Promise<SearchResult<Movie>> {
    const data = await this.request("/search/movie", { query, page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async searchTVShows(
    query: string,
    page: number = 1
  ): Promise<SearchResult<TVShow>> {
    const data = await this.request("/search/tv", { query, page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Search All (multi: movie, tv, person)
  async searchAll(query: string, page: number = 1): Promise<MultiSearchResult> {
    const data = await this.request("/search/multi", { query, page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Search Collection (khusus koleksi film)
  async searchCollection(
    query: string,
    page: number = 1
  ): Promise<SearchResult<Collection>> {
    const data = await this.request("/search/collection", { query, page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Authentication: Request Token (Gunakan Mode User)
  async createRequestToken(): Promise<{
    success: boolean;
    expires_at: string;
    request_token: string;
  }> {
    const data = await this.request("/authentication/token/new");
    return data;
  }

  // Authentication: Create Session with Login (username/password)
  async createSessionWithLogin(
    username: string,
    password: string,
    requestToken: string
  ): Promise<{
    success: boolean;
    session_id: string;
  }> {
    return this.post("/authentication/token/validate_with_login", {
      username,
      password,
      request_token: requestToken,
    });
  }

  // Authentication: Create Session from approved request token
  async createSession(requestToken: string): Promise<{
    success: boolean;
    session_id: string;
  }> {
    return this.post("/authentication/session/new", {
      request_token: requestToken,
    });
  }

  // Authentication: Delete Session (logout)
  async deleteSession(sessionId: string): Promise<{
    success: boolean;
    status_message: string;
  }> {
    const url = new URL(`${TMDB_BASE_URL}/authentication/session`);
    url.searchParams.append("api_key", this.apiKey);

    try {
      const response = await axios.delete(url.toString(), {
        data: { session_id: sessionId },
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        `TMDb API error: ${error.response?.status} ${error.response?.statusText}`
      );
    }
  }

  // Get Account Details
  async getAccountDetails(sessionId: string): Promise<{
    id: number;
    name: string;
    username: string;
    avatar: any;
  }> {
    const data = await this.request("/account", { session_id: sessionId });
    return data;
  }

  // Discover with filters
  async discoverMovies(
    params: {
      genre?: number;
      year?: number;
      sort_by?: string;
      vote_average_gte?: number;
      page?: number;
    } = {}
  ): Promise<SearchResult<Movie>> {
    const data = await this.request("/discover/movie", params);
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async discoverTV(
    params: {
      genre?: number;
      year?: number;
      sort_by?: string;
      vote_average_gte?: number;
      page?: number;
    } = {}
  ): Promise<SearchResult<TVShow>> {
    const data = await this.request("/discover/tv", params);
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  //add to favorite(post/get)
  async addFavorite(
    accountId: string,
    sessionId: string,
    mediaId: number,
    mediaType: "movie" | "tv" = "movie",
    favorite: boolean = true
  ): Promise<FavoriteResult> {
    return this.post(
      `/account/${accountId}/favorite`,
      {
        media_type: mediaType,
        media_id: mediaId,
        favorite,
      },
      { session_id: sessionId }
    );
  }

  async getFavorites(
    accountId: string,
    sessionId: string,
    page: number = 1
  ): Promise<SearchResult<Movie>> {
    const data = await this.request(`/account/${accountId}/favorite/movies`, {
      session_id: sessionId,
      page,
    });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async getFavoriteTVShows(
    accountId: string,
    sessionId: string,
    page: number = 1
  ): Promise<SearchResult<TVShow>> {
    const data = await this.request(`/account/${accountId}/favorite/tv`, {
      session_id: sessionId,
      page,
    });
    data.results = this.mapImagePaths(data.results);
    return data;
  }
}

// Export instance
export const tmdbService = new TMDbService();

// Also export functions for convenience
export const getPopularMovies = (page: number = 1) => tmdbService.getPopularMovies(page);
export const getPopularTVShows = (page: number = 1) => tmdbService.getPopularTVShows(page);
export const getMovieGenres = () => tmdbService.getMovieGenres();
export const getMoviesByGenre = (genreId: number, page: number = 1) =>
  tmdbService.getMoviesByGenre(genreId, page);
export const getTVByGenre = (genreId: number, page: number = 1) =>
  tmdbService.getTVByGenre(genreId, page);
export const getNowPlayingMovies = () => tmdbService.getNowPlayingMovies();
export const getOnTheAirTV = () => tmdbService.getOnTheAirTV();
export const getTrending = (
  mediaType: "movie" | "tv" | "person",
  timeWindow: "day" | "week" = "day"
) => tmdbService.getTrending(mediaType, timeWindow);
export const discoverMovies = (params: any) =>
  tmdbService.discoverMovies(params);
export const discoverTV = (params: any) => tmdbService.discoverTV(params);
export const getSimilarMovies = (movieId: number, page: number = 1) =>
  tmdbService.getSimilarMovies(movieId, page);
export const getSimilarTVShows = (tvId: number, page: number = 1) =>
  tmdbService.getSimilarTVShows(tvId, page);

// Favorites
export const addFavorite = (
  accountId: string,
  sessionId: string,
  mediaId: number,
  mediaType: "movie" | "tv" = "movie",
  favorite: boolean = true
) =>
  tmdbService.addFavorite(accountId, sessionId, mediaId, mediaType, favorite);
export const getFavorites = (
  accountId: string,
  sessionId: string,
  page: number = 1
) => tmdbService.getFavorites(accountId, sessionId, page);
export const getFavoriteTVShows = (
  accountId: string,
  sessionId: string,
  page: number = 1
) => tmdbService.getFavoriteTVShows(accountId, sessionId, page);

// Ratings
export const addMovieRating = (
  movieId: number,
  rating: number,
  sessionId: string
) => tmdbService.addMovieRating(movieId, rating, sessionId);
export const addTVRating = (tvId: number, rating: number, sessionId: string) =>
  tmdbService.addTVRating(tvId, rating, sessionId);
export const deleteMovieRating = (movieId: number, sessionId: string) =>
  tmdbService.deleteMovieRating(movieId, sessionId);
export const deleteTVRating = (tvId: number, sessionId: string) =>
  tmdbService.deleteTVRating(tvId, sessionId);
export const getRatedMovies = (
  accountId: string,
  sessionId: string,
  page: number = 1
) => tmdbService.getRatedMovies(accountId, sessionId, page);
export const getRatedTVShows = (
  accountId: string,
  sessionId: string,
  page: number = 1
) => tmdbService.getRatedTVShows(accountId, sessionId, page);
