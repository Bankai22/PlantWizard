import React, { useState } from 'react';
import { SearchHistoryProps, SearchHistoryItem } from '../types';

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  history, 
  onSelectItem, 
  onClearHistory, 
  onDeleteItem 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0) {
    return null;
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const displayedHistory = isExpanded ? history : history.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🕒</span>
          Recent Searches
        </h3>
        <div className="flex gap-2">
          {history.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isExpanded ? 'Show Less' : `Show All (${history.length})`}
            </button>
          )}
          <button
            onClick={onClearHistory}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {displayedHistory.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
            onClick={() => onSelectItem(item)}
          >
            <div className="flex items-center space-x-3 flex-1">
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.plantName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {item.plantName}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    {item.searchType === 'image' ? '📷' : '🔍'}
                    <span className="ml-1">
                      {item.searchType === 'image' ? 'Image' : 'Text'} search
                    </span>
                  </span>
                  <span>•</span>
                  <span>{formatTimestamp(item.timestamp)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(item.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
              title="Delete this search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory; 