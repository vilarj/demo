import { MockInventorySystem } from '../inventory-api';

export interface IEmployeeSelectorProps {
  inventorySystem: MockInventorySystem;
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  debounceMs?: number;
}
