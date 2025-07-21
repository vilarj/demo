import { Tool } from '../inventory-api';

export interface IPaginationOptions {
  page: number;
  pageSize: number;
  filter?: 'all' | 'assigned' | 'available';
  sortBy?: keyof Tool;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
