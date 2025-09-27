import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Movie, TVShow } from '../lib/api/TMDbServices';

interface SearchSectionProps {
  searchResults: (Movie | TVShow)[];
}

const SearchSection: React.FC<SearchSectionProps> = ({ searchResults }) => {
  if (searchResults.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((item) => (
          <Card key={item.id}>
            {item.poster_path && (
              <img src={item.poster_path} alt={'title' in item ? item.title : item.name} className="w-full h-64 object-cover" />
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
    </section>
  );
};

export default SearchSection;
