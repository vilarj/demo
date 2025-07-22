import { ISO8601Date } from '../types/AssignmentType';
import { Employee, EmployeeDirectory, EmployeeId } from '../types/EmployeeInventoryType';
import { Tool, ToolId, ToolInventory } from '../types/ToolInventoryType';

/**
 * Shared data store for inventory system.
 * Provides centralized data management and utility methods.
 */
export class DataStore {
  protected readonly tools: ToolInventory;
  protected readonly employees: EmployeeDirectory;

  constructor(tools: ToolInventory, employees: EmployeeDirectory) {
    // Share the same data references across all services to ensure changes are reflected
    this.tools = tools;
    this.employees = employees;
  }

  /**
   * Retrieves a tool by its ID from the internal inventory.
   * @param {ToolId} toolId - The ID of the tool to retrieve.
   * @returns {Tool | null} The tool object if found, otherwise `null`.
   */
  protected toolById(toolId: ToolId): Tool | null {
    return this.tools[toolId] ?? null;
  }

  /**
   * Retrieves an employee by their ID from the internal directory.
   * @param {EmployeeId} employeeId - The ID of the employee to retrieve.
   * @returns {Employee | null} The employee object if found, otherwise `null`.
   */
  protected employeeById(employeeId: EmployeeId): Employee | null {
    return this.employees[employeeId] ?? null;
  }

  /**
   * Returns today's date in ISO 8601 (YYYY-MM-DD) format.
   * @returns {ISO8601Date} The current date as an ISO 8601 string.
   */
  protected static today(): ISO8601Date {
    return new Date().toISOString().split('T')[0] as ISO8601Date;
  }

  /**
   * Simulates network delay.
   * @param {number} delay - The delay in milliseconds.
   * @returns {Promise<void>} A promise that resolves after the specified delay.
   */
  protected static async simulateDelay(delay: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }
}
