/// <reference types="vite/client" />

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

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

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
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

  // Trending
  async getTrending(mediaType: 'movie' | 'tv' | 'person', timeWindow: 'day' | 'week' = 'day') {
    const data = await this.request(`/trending/${mediaType}/${timeWindow}`);
    data.results = data.results.map((item: any) => {
      if (item.poster_path) item.poster_path = `${IMAGE_BASE_URL}w500${item.poster_path}`;
      if (item.backdrop_path) item.backdrop_path = `${IMAGE_BASE_URL}original${item.backdrop_path}`;
      if (item.profile_path) item.profile_path = `${IMAGE_BASE_URL}w500${item.profile_path}`;
      return item;
    });
    return data;
  }

  // Popular
  async getPopularMovies(page: number = 1) {
    const data = await this.request('/movie/popular', { page });
    data.results = data.results.map((item: any) => {
      if (item.poster_path) item.poster_path = `${IMAGE_BASE_URL}w500${item.poster_path}`;
      if (item.backdrop_path) item.backdrop_path = `${IMAGE_BASE_URL}original${item.backdrop_path}`;
      return item;
    });
    return data;
  }

  async getPopularTVShows(page: number = 1) {
    const data = await this.request('/tv/popular', { page });
    data.results = data.results.map((item: any) => {
      if (item.poster_path) item.poster_path = `${IMAGE_BASE_URL}w500${item.poster_path}`;
      if (item.backdrop_path) item.backdrop_path = `${IMAGE_BASE_URL}original${item.backdrop_path}`;
      return item;
    });
    return data;
  }

  async getPopularPeople(page: number = 1) {
    const data = await this.request('/person/popular', { page });
    data.results = data.results.map((item: any) => {
      if (item.profile_path) item.profile_path = `${IMAGE_BASE_URL}w500${item.profile_path}`;
      return item;
    });
    return data;
  }

  // Search
  async searchMovies(query: string, page: number = 1) {
    const data = await this.request('/search/movie', { query, page });
    data.results = data.results.map((item: any) => {
      if (item.poster_path) item.poster_path = `${IMAGE_BASE_URL}w500${item.poster_path}`;
      if (item.backdrop_path) item.backdrop_path = `${IMAGE_BASE_URL}original${item.backdrop_path}`;
      return item;
    });
    return data;
  }

  async searchTVShows(query: string, page: number = 1) {
    const data = await this.request('/search/tv', { query, page });
    data.results = data.results.map((item: any) => {
      if (item.poster_path) item.poster_path = `${IMAGE_BASE_URL}w500${item.poster_path}`;
      if (item.backdrop_path) item.backdrop_path = `${IMAGE_BASE_URL}original${item.backdrop_path}`;
      return item;
    });
    return data;
  }

  async searchPeople(query: string, page: number = 1) {
    const data = await this.request('/search/person', { query, page });
    data.results = data.results.map((item: any) => {
      if (item.profile_path) item.profile_path = `${IMAGE_BASE_URL}w500${item.profile_path}`;
      return item;
    });
    return data;
  }

  // Details
  async getMovieDetails(id: number) {
    const data = await this.request(`/movie/${id}`);
    // Append image paths
    if (data.poster_path) data.poster_path = `${IMAGE_BASE_URL}w500${data.poster_path}`;
    if (data.backdrop_path) data.backdrop_path = `${IMAGE_BASE_URL}original${data.backdrop_path}`;
    return data;
  }

  async getTVShowDetails(id: number) {
    const data = await this.request(`/tv/${id}`);
    if (data.poster_path) data.poster_path = `${IMAGE_BASE_URL}w500${data.poster_path}`;
    if (data.backdrop_path) data.backdrop_path = `${IMAGE_BASE_URL}original${data.backdrop_path}`;
    return data;
  }

  async getPersonDetails(id: number) {
    const data = await this.request(`/person/${id}`);
    if (data.profile_path) data.profile_path = `${IMAGE_BASE_URL}w500${data.profile_path}`;
    return data;
  }

  // Credits
  async getMovieCredits(id: number) {
    const { cast, crew } = await this.request(`/movie/${id}/credits`);
    // Enhance with images
    cast.forEach((person: Credit) => {
      if (person.profile_path) person.profile_path = `${IMAGE_BASE_URL}w200${person.profile_path}`;
    });
    return { cast, crew };
  }

  async getTVShowCredits(id: number) {
    const { cast, crew } = await this.request(`/tv/${id}/credits`);
    cast.forEach((person: Credit) => {
      if (person.profile_path) person.profile_path = `${IMAGE_BASE_URL}w200${person.profile_path}`;
    });
    return { cast, crew };
  }

  async getPersonCredits(id: number) {
    return this.request(`/person/${id}/movie_credits`);
  }

  // Videos
  async getMovieVideos(id: number) {
    const { results } = await this.request(`/movie/${id}/videos`);
    return results.filter((video: Video) => video.site === 'YouTube' && video.type === 'Trailer');
  }

  async getTVShowVideos(id: number) {
    const { results } = await this.request(`/tv/${id}/videos`);
    return results.filter((video: Video) => video.site === 'YouTube' && video.type === 'Trailer');
  }

  // Recommendations / Similar
  async getMovieRecommendations(id: number, page: number = 1) {
    return this.request(`/movie/${id}/recommendations`, { page });
  }

  async getTVShowRecommendations(id: number, page: number = 1) {
    return this.request(`/tv/${id}/recommendations`, { page });
  }

  async getMovieSimilar(id: number, page: number = 1) {
    return this.request(`/movie/${id}/similar`, { page });
  }

  async getTVShowSimilar(id: number, page: number = 1) {
    return this.request(`/tv/${id}/similar`, { page });
  }

  // Watch Providers
  async getMovieWatchProviders(id: number) {
    return this.request(`/movie/${id}/watch/providers`);
  }

  async getTVShowWatchProviders(id: number) {
    return this.request(`/tv/${id}/watch/providers`);
  }

  // Hero: Random trending movie trailer
  async getRandomTrendingMovieTrailer() {
    const trending = await this.getTrending('movie', 'day');
    const randomMovie = trending.results[Math.floor(Math.random() * trending.results.length)] as Movie;
    const videos = await this.getMovieVideos(randomMovie.id);
    return { movie: randomMovie, trailer: videos[0] };
  }
}

// Export instance
export const tmdbService = new TMDbService();

// Also export functions for convenience
export const getPopularMovies = () => tmdbService.getPopularMovies();
export const getPopularTVShows = () => tmdbService.getPopularTVShows();
export const searchMovies = (query: string) => tmdbService.searchMovies(query);
export const searchTVShows = (query: string) => tmdbService.searchTVShows(query);
export const getMovieDetails = (id: number) => tmdbService.getMovieDetails(id);
export const getTVShowDetails = (id: number) => tmdbService.getTVShowDetails(id);
