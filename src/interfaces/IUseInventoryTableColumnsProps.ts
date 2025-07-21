import dayjs from 'dayjs';
import { BaseSelectRef } from 'rc-select';
import { MockInventorySystem } from '../inventory-api';
import { IEditingState } from './IEditingState';

export interface IUseInventoryTableColumnsProps {
  editingState: IEditingState | null;
  employeeSearchText: string;
  filteredEmployees: { id: string; name: string }[];
  employeeMap: Record<string, { name: string; id: string }>;
  handleEmployeeSelect: (value: string) => void;
  handleEmployeeSearch: (searchText: string) => void;
  handleDateChange: (date: dayjs.Dayjs | null) => void;
  handleEdit: (toolId: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleUnassign: (toolId: string) => void;
  inputRef: React.RefObject<BaseSelectRef>;
  inventorySystem: MockInventorySystem;
}
