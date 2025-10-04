import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useSearchParams } from 'react-router-dom';
import { tmdbService, Movie, TVShow } from '../lib/api/TMDbServices';

const SearchSection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await tmdbService.searchMovies(query);
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [query]);

  if (!query.trim()) return null;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">
        Search Results for: <span className="text-yellow-500">{query}</span>
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item) => (
            <Card key={item.id}>
              {item.poster_path && (
                <img
                  src={item.poster_path}
                  alt={'title' in item ? item.title : item.name}
                  className="w-full h-64 object-cover"
                />
              )}
              <CardHeader>
                <CardTitle className="text-lg">
                  {'title' in item ? item.title : item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.overview}
                </p>
                <p className="text-sm mt-2">
                  Rating: {item.vote_average}/10
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchSection;
