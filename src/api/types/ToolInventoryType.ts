import { ISO8601Date } from './AssignmentType';
import { EmployeeId } from './EmployeeInventoryType';

/**
 * Defines the possible types of tools in the inventory system.
 */
export type ToolType = 'HydraulicWrench' | 'PneumaticWrench' | 'Tensioner' | 'TorqueGun' | 'TorqueMultiplier';

/**
 * Represents a unique identifier for a tool.
 * @example "T67890"
 */
export type ToolId = `T${number}`;

/**
 * Represents a tool in the inventory system.
 */
export type Tool = {
  /** The unique ID of the tool. */
  id: ToolId;
  /** The category or type of the tool. */
  type: ToolType;
  /** The specific model of the tool. */
  model: string;
  /** The serial number of the tool. */
  serialNumber: string;
  /** The date by which the tool must be calibrated, in ISO 8601 format. */
  calibrationDueDate: ISO8601Date;
  /** The ID of the employee to whom the tool is currently assigned, if any. */
  assignedTo?: EmployeeId | null;
  /** The date on which the tool was assigned, in ISO 8601 format, if assigned. */
  assignedOn?: ISO8601Date | null;
};

/**
 * A dictionary-like type where keys are `ToolId` and values are `Tool` objects.
 * This provides quick lookup for tool details by their ID.
 */
export type ToolInventory = Record<ToolId, Tool>;
