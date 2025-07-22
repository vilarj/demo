import { useState } from 'react';
import { Tool } from '../../inventory-api';

export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UseInventoryPaginationResult {
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  sortBy: keyof Tool;
  setSortBy: (sortBy: keyof Tool) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  resetPagination: () => void;
}

/**
 * Hook for managing pagination and sorting state
 * Handles current page, page size, total counts, and sort configuration
 */
export function useInventoryPagination(): UseInventoryPaginationResult {
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const [sortBy, setSortBy] = useState<keyof Tool>('type');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const resetPagination = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  return {
    pagination,
    setPagination,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetPagination,
  };
}
