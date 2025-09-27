import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { tmdbService, Movie, TVShow, Person } from '../lib/api/TMDbService';

const MainPage: React.FC = () => {
  const location = useLocation();
  const [content, setContent] = useState<{
    trendingMovies: Movie[];
    trendingTV: TVShow[];
    trendingPeople: Person[];
    popularMovies: Movie[];
    popularTV: TVShow[];
    randomTrailer: any;
  }>({
    trendingMovies: [],
    trendingTV: [],
    trendingPeople: [],
    popularMovies: [],
    popularTV: [],
    randomTrailer: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingMovies, trendingTV, trendingPeople, popularMovies, popularTV, randomTrailer] = await Promise.all([
          tmdbService.getTrending('movie'),
          tmdbService.getTrending('tv'),
          tmdbService.getTrending('person'),
          tmdbService.getPopularMovies(),
          tmdbService.getPopularTVShows(),
          tmdbService.getRandomTrendingMovieTrailer(),
        ]);
        setContent({
          trendingMovies: trendingMovies.results,
          trendingTV: trendingTV.results,
          trendingPeople: trendingPeople.results,
          popularMovies: popularMovies.results,
          popularTV: popularTV.results,
          randomTrailer,
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const renderContent = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') {
      return (
        <div>
          {/* Hero Section */}
          {content.randomTrailer && (
            <div className="relative h-96 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${content.randomTrailer.trailer?.key}?autoplay=1&mute=1&loop=1&playlist=${content.randomTrailer.trailer?.key}`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
              ></iframe>
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <h1 className="text-white text-4xl font-bold">{content.randomTrailer.movie.title}</h1>
              </div>
            </div>
          )}
          {/* Trending Sections */}
          <section className="p-4">
            <h2 className="text-2xl font-bold mb-4">Trending Movies</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {content.trendingMovies.slice(0, 5).map((movie) => (
                <div key={movie.id} className="bg-gray-800 p-2 rounded">
                  {movie.poster_path && <img src={movie.poster_path} alt={movie.title} className="w-full h-64 object-cover" />}
                  <h3 className="text-white mt-2">{movie.title}</h3>
                </div>
              ))}
            </div>
          </section>
          <section className="p-4">
            <h2 className="text-2xl font-bold mb-4">Trending TV Shows</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {content.trendingTV.slice(0, 5).map((show) => (
                <div key={show.id} className="bg-gray-800 p-2 rounded">
                  {show.poster_path && <img src={show.poster_path} alt={show.name} className="w-full h-64 object-cover" />}
                  <h3 className="text-white mt-2">{show.name}</h3>
                </div>
              ))}
            </div>
          </section>
          <section className="p-4">
            <h2 className="text-2xl font-bold mb-4">Trending People</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {content.trendingPeople.slice(0, 5).map((person) => (
                <div key={person.id} className="bg-gray-800 p-2 rounded">
                  {person.profile_path && <img src={person.profile_path} alt={person.name} className="w-full h-64 object-cover" />}
                  <h3 className="text-white mt-2">{person.name}</h3>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    } else if (path === '/movie') {
      return (
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Popular Movies</h1>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {content.popularMovies.map((movie) => (
              <div key={movie.id} className="bg-gray-800 p-2 rounded">
                {movie.poster_path && <img src={movie.poster_path} alt={movie.title} className="w-full h-64 object-cover" />}
                <h3 className="text-white mt-2">{movie.title}</h3>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (path === '/tv') {
      return (
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Popular TV Shows</h1>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {content.popularTV.map((show) => (
              <div key={show.id} className="bg-gray-800 p-2 rounded">
                {show.poster_path && <img src={show.poster_path} alt={show.name} className="w-full h-64 object-cover" />}
                <h3 className="text-white mt-2">{show.name}</h3>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (path === '/trending') {
      return (
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Trending</h1>
          {/* Similar to home, but focused on trending */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Movies</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {content.trendingMovies.slice(0, 10).map((movie) => (
                <div key={movie.id} className="bg-gray-800 p-2 rounded">
                  {movie.poster_path && <img src={movie.poster_path} alt={movie.title} className="w-full h-64 object-cover" />}
                  <h3 className="text-white mt-2">{movie.title}</h3>
                </div>
              ))}
            </div>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">TV Shows</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {content.trendingTV.slice(0, 10).map((show) => (
                <div key={show.id} className="bg-gray-800 p-2 rounded">
                  {show.poster_path && <img src={show.poster_path} alt={show.name} className="w-full h-64 object-cover" />}
                  <h3 className="text-white mt-2">{show.name}</h3>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">People</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {content.trendingPeople.slice(0, 10).map((person) => (
                <div key={person.id} className="bg-gray-800 p-2 rounded">
                  {person.profile_path && <img src={person.profile_path} alt={person.name} className="w-full h-64 object-cover" />}
                  <h3 className="text-white mt-2">{person.name}</h3>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    }
    return <div>Page not found</div>;
  };

  return <div className="bg-gray-900 text-white min-h-screen">{renderContent()}</div>;
};

export default MainPage;
