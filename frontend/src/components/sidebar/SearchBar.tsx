'use client';

interface SearchBarProps {
  query: string;
  setQuery: (val: string) => void;
}

export default function SearchBar({ query, setQuery }: SearchBarProps) {

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full pl-9 pr-3 py-1.5 bg-[#F6F6F6] text-signal-text-primary border-transparent rounded-full text-sm placeholder-gray-500 focus:border-signal-blue focus:bg-white focus:ring-1 focus:ring-signal-blue outline-none transition-colors h-9"
      />
    </div>
  );
}
