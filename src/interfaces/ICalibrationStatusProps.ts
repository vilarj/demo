import { InventoryAPI } from '../api';

export interface ICalibrationStatusProps {
  days: number;
  toolId: string;
  serialNumber: string;
  inventorySystem: InventoryAPI;
}
