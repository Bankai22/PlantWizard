
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (plantName: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-lg mx-auto mb-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter plant name (e.g., Monstera Deliciosa)"
        className="flex-grow p-3 border border-primary-light rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-200 font-sans text-neutral-dark placeholder-neutral"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-sans"
        disabled={isLoading || !query.trim()}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default SearchBar;
