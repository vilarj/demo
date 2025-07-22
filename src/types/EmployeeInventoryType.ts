/**
 * Represents a unique identifier for an employee.
 * @example "E12345"
 */
export type EmployeeId = `E${number}`;

export type Employee = {
  /** The unique ID of the employee. */
  id: EmployeeId;
  /** The full name of the employee. */
  name: string;
};

/**
 * A dictionary-like type where keys are `EmployeeId` and values are `Employee` objects.
 * This provides quick lookup for employee details by their ID.
 */
export type EmployeeDirectory = Record<EmployeeId, Employee>;
