import { useEffect, useState } from 'react';
import { TabType } from '../../types/TabType';

export interface UseInventorySearchResult {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  debouncedSearchText: string;
}

/**
 * Hook for managing search and filtering functionality
 * Handles tab filtering, search text input, and debounced search
 */
export function useInventorySearch(): UseInventorySearchResult {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  return {
    activeTab,
    setActiveTab,
    searchText,
    setSearchText,
    debouncedSearchText,
  };
}
