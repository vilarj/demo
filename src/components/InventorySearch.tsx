import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { IInventorySearchProps } from '../interfaces/IInventorySearchProps';

const InventorySearch: React.FC<IInventorySearchProps> = React.memo(
  ({
    inventorySystem,
    onSearchResults,
    onSearchChange,
    placeholder = 'Search',
    className = 'w-64',
    debounceMs = 300,
  }) => {
    const [searchText, setSearchText] = useState('');

    const performSearch = useCallback(
      async (currentSearchText: string) => {
        if (!currentSearchText.trim()) {
          return;
        }

        try {
          const results = await inventorySystem.search(currentSearchText);
          onSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          onSearchResults([]);
        }
      },
      [inventorySystem, onSearchResults],
    );

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        performSearch(searchText);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    }, [searchText, debounceMs, performSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      onSearchChange?.(value);
    };

    return (
      <div className="flex items-center space-x-2">
        <Input
          placeholder={placeholder}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          className={className}
          allowClear
        />
      </div>
    );
  },
);

export default InventorySearch;
