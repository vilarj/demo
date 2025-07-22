import { SearchOutlined } from '@ant-design/icons';
import { Input, Space } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { IInventorySearchProps } from '../interfaces/IInventorySearchProps';

/**
 * `InventorySearch` - A debounced search input component for filtering inventory tools
 *
 * This component provides a search interface that debounces user input to prevent
 * excessive API calls while searching through inventory tools. It integrates with
 * Ant Design's Input component and provides real-time search functionality.
 *
 * @component
 *
 * @param props - The component props
 * @param props.inventorySystem - The inventory system instance used for searching tools
 * @param props.onSearchResults - Callback function that receives search results (Tool[])
 * @param props.onSearchChange - Optional callback for input value changes
 * @param props.placeholder - Placeholder text for the search input (default: 'Search')
 * @param props.className - CSS class name for styling the input (default: 'w-64')
 * @param props.debounceMs - Debounce delay in milliseconds for search requests (default: 300)
 *
 * @returns A memoized React functional component
 *
 * @throws Will log errors to console if search operation fails
 */
const InventorySearch: React.FC<IInventorySearchProps> = React.memo(
  ({
    inventorySystem,
    onSearchResults,
    onSearchChange,
    placeholder = 'Search',
    className = 'w-64',
    debounceMs = 300,
  }) => {
    // Local state for managing the search input value
    const [searchText, setSearchText] = useState<string>('');

    /**
     * Performs the actual search operation using the inventory system
     *
     * @param currentSearchText - The text to search for
     * @returns Promise that resolves when search is complete
     *
     * @internal
     */
    const performSearch = useCallback(
      async (currentSearchText: string): Promise<void> => {
        // Skip search if input is empty or only whitespace
        if (!currentSearchText.trim()) {
          return;
        }

        try {
          const results = await inventorySystem.search(currentSearchText);
          onSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          // Return empty results on error to maintain consistent UX
          onSearchResults([]);
        }
      },
      [inventorySystem, onSearchResults],
    );

    /**
     * Effect hook that implements debounced search functionality
     * Delays search execution until user stops typing for the specified debounce period
     */
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        performSearch(searchText);
      }, debounceMs);

      // Cleanup function to cancel pending search if input changes
      return () => clearTimeout(timeoutId);
    }, [searchText, debounceMs, performSearch]);

    /**
     * Handles input change events and updates local state
     *
     * @param e - The input change event
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setSearchText(value);

      // Call optional change handler if provided
      onSearchChange?.(value);
    };

    return (
      <Space className="flex items-center space-x-2">
        <Input
          placeholder={placeholder}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          className={className}
          allowClear
          aria-label="Search inventory tools"
          role="searchbox"
        />
      </Space>
    );
  },
);

export default InventorySearch;
