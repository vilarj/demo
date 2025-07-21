import { MockInventorySystem, Tool } from '../inventory-api';

export interface IInventorySearchProps {
  inventorySystem: MockInventorySystem;
  onSearchResults: (results: Tool[]) => void;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}
