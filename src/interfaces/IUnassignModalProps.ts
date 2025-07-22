import { Employee, Tool } from '../api';

export interface IUnassignModalProps {
  visible: boolean;
  selectedTool: Tool | null;
  employeeMap: Record<string, Employee>;
  onConfirm: () => void;
  onCancel: () => void;
}
