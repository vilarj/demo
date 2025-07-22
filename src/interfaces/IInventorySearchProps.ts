import { InventoryAPI, Tool } from '../api';

export interface IInventorySearchProps {
  inventorySystem: InventoryAPI;
  onSearchResults: (results: Tool[]) => void;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  filter?: 'all' | 'assigned' | 'available';
}
