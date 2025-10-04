import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSearchParams } from 'react-router-dom';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isSearching }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // setiap kali q di URL berubah, sinkronkan inputnya
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex gap-2 mb-8 justify-center">
      <Input
        placeholder="Search movies or TV shows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        className="max-w-md"
      />
      <Button onClick={handleSearch} disabled={isSearching}>
        {isSearching ? 'Searching...' : 'Search'}
      </Button>
    </div>
  );
};

export default SearchBar;
