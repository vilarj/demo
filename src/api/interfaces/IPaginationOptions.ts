import { Tool } from '../types/ToolInventoryType';

export interface IPaginationOptions {
  page: number;
  pageSize: number;
  filter?: 'all' | 'assigned' | 'available';
  sortBy?: keyof Tool;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
