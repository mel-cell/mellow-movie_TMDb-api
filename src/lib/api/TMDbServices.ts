/// <reference types="vite/client" />

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Pastikan IMAGE_BASE_URL memiliki garis miring di akhir untuk konsistensi
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'; // Tanpa '/' di akhir

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

class TMDbService {
  private apiKey: string;

  constructor() {
    if (!TMDB_API_KEY) {
      throw new Error('VITE_TMDB_API_KEY is required in .env.local');
    }
    this.apiKey = TMDB_API_KEY;
  }

  private async request(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('language', 'en-US'); // Default language

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
  
  // Perbaikan: Fungsi Helper untuk memetakan path gambar menjadi URL lengkap
  private mapImagePaths(results: any[]): any[] {
    const IMAGE_SIZE_POSTER = 'w500';
    const IMAGE_SIZE_BACKDROP = 'original';
    const IMAGE_SIZE_PROFILE = 'w500'; // Untuk aktor

    return results.map(item => {
        // Gabungkan Base URL, Ukuran, dan Path. Tambahkan '/' setelah IMAGE_BASE_URL
        if (item.poster_path) item.poster_path = `${IMAGE_BASE_URL}/${IMAGE_SIZE_POSTER}${item.poster_path}`;
        if (item.backdrop_path) item.backdrop_path = `${IMAGE_BASE_URL}/${IMAGE_SIZE_BACKDROP}${item.backdrop_path}`;
        if (item.profile_path) item.profile_path = `${IMAGE_BASE_URL}/${IMAGE_SIZE_PROFILE}${item.profile_path}`;
        return item;
    });
  }

  // =================================================================
  // FUNCTIONS DENGAN LOGIKA PEMETAAN YANG SUDAH DI-REFACTOR
  // =================================================================
  
  // Trending
  async getTrending(mediaType: 'movie' | 'tv' | 'person', timeWindow: 'day' | 'week' = 'day'): Promise<SearchResult<Movie | TVShow>> {
    const data = await this.request(`/trending/${mediaType}/${timeWindow}`);
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Popular
  async getPopularMovies(page: number = 1): Promise<SearchResult<Movie>> {
    const data = await this.request('/movie/popular', { page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async getPopularTVShows(page: number = 1): Promise<SearchResult<TVShow>> {
    const data = await this.request('/tv/popular', { page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Genres
  async getMovieGenres(): Promise<Genre[]> {
    const data = await this.request('/genre/movie/list');
    return data.genres;
  }

  // Discover by Genre
  async getMoviesByGenre(genreId: number, page: number = 1): Promise<SearchResult<Movie>> {
    const data = await this.request('/discover/movie', { with_genres: genreId, page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async getTVByGenre(genreId: number, page: number = 1): Promise<SearchResult<TVShow>> {
    const data = await this.request('/discover/tv', { with_genres: genreId, page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }
  
  // Premieres / Now Playing
  async getNowPlayingMovies(page: number = 1): Promise<SearchResult<Movie>> {
    const data = await this.request('/movie/now_playing', { page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async getOnTheAirTV(page: number = 1): Promise<SearchResult<TVShow>> {
    const data = await this.request('/tv/on_the_air', { page });
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
    return data.results.filter((video: Video) => video.site === 'YouTube');
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
    return data.results.filter((video: Video) => video.site === 'YouTube');
  }

  async getTVCredits(tvId: number): Promise<{ cast: Credit[] }> {
    const data = await this.request(`/tv/${tvId}/credits`);
    data.cast = this.mapImagePaths(data.cast);
    return data;
  }

  // Search
  async searchMovies(query: string, page: number = 1): Promise<SearchResult<Movie>> {
    const data = await this.request('/search/movie', { query, page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async searchTVShows(query: string, page: number = 1): Promise<SearchResult<TVShow>> {
    const data = await this.request('/search/tv', { query, page });
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  // Discover with filters
  async discoverMovies(params: {
    genre?: number;
    year?: number;
    sort_by?: string;
    vote_average_gte?: number;
    page?: number;
  } = {}): Promise<SearchResult<Movie>> {
    const data = await this.request('/discover/movie', params);
    data.results = this.mapImagePaths(data.results);
    return data;
  }

  async discoverTV(params: {
    genre?: number;
    year?: number;
    sort_by?: string;
    vote_average_gte?: number;
    page?: number;
  } = {}): Promise<SearchResult<TVShow>> {
    const data = await this.request('/discover/tv', params);
    data.results = this.mapImagePaths(data.results);
    return data;
  }
}

// Export instance
export const tmdbService = new TMDbService();

// Also export functions for convenience
export const getPopularMovies = () => tmdbService.getPopularMovies();
export const getPopularTVShows = () => tmdbService.getPopularTVShows();
export const getMovieGenres = () => tmdbService.getMovieGenres();
export const getMoviesByGenre = (genreId: number) => tmdbService.getMoviesByGenre(genreId);
export const getTVByGenre = (genreId: number) => tmdbService.getTVByGenre(genreId);
export const getNowPlayingMovies = () => tmdbService.getNowPlayingMovies();
export const getOnTheAirTV = () => tmdbService.getOnTheAirTV();
export const getTrending = (mediaType: 'movie' | 'tv' | 'person', timeWindow: 'day' | 'week' = 'day') => tmdbService.getTrending(mediaType, timeWindow);
export const discoverMovies = (params: any) => tmdbService.discoverMovies(params);
export const discoverTV = (params: any) => tmdbService.discoverTV(params);
