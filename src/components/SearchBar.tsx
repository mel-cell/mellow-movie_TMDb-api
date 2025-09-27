import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onSearch, isSearching }) => {
  return (
    <div className="flex gap-2 mb-8 justify-center">
      <Input
        placeholder="Search movies or TV shows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
        className="max-w-md"
      />
      <Button onClick={onSearch} disabled={isSearching}>
        {isSearching ? 'Searching...' : 'Search'}
      </Button>
    </div>
  );
};

export default SearchBar;
