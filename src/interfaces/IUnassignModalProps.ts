import { Employee, Tool } from '../inventory-api';

export interface IUnassignModalProps {
  visible: boolean;
  selectedTool: Tool | null;
  employeeMap: Record<string, Employee>;
  onConfirm: () => void;
  onCancel: () => void;
}
