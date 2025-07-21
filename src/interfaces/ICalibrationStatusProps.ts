import { MockInventorySystem } from '../inventory-api';

export interface ICalibrationStatusProps {
  days: number;
  toolId: string;
  serialNumber: string;
  inventorySystem: MockInventorySystem;
}
