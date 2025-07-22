import { AssigmentResult, ISO8601Date, UnassignResult } from '../types/AssignmentType';
import { Employee, EmployeeDirectory, EmployeeId } from '../types/EmployeeInventoryType';
import { Tool, ToolId, ToolInventory } from '../types/ToolInventoryType';
import { DataStore } from './DataStore';

/**
 * Service for managing tool assignment operations.
 * Handles assigning, reassigning, and unassigning tools to/from employees.
 */
export class AssignmentService extends DataStore {
  private readonly delay: number;

  constructor(tools: ToolInventory, employees: EmployeeDirectory, delay: number = 300) {
    super(tools, employees);
    this.delay = delay;
  }

  /**
   * Assigns a tool to an employee, updating the tool's `assignedTo` and `assignedOn` properties.
   * It also checks if the tool's calibration is overdue.
   * @private
   * @param {Tool} tool - The tool object to be assigned.
   * @param {Employee} employee - The employee object to whom the tool is being assigned.
   * @param {ISO8601Date} [assignedOn] - Optional custom assignment date. If not provided, uses today's date.
   * @returns {AssigmentResult} An object indicating the success or failure of the assignment.
   */
  private static assignToEmployee(tool: Tool, employee: Employee, assignedOn?: ISO8601Date): AssigmentResult {
    const today = DataStore.today();
    if (tool.calibrationDueDate < today) {
      return {
        ok: false,
        error: `Tool with ID ${tool.id} is overdue for calibration and cannot be assigned.`,
      };
    }
    tool.assignedTo = employee.id;
    tool.assignedOn = assignedOn || today;
    return { ok: true, tool };
  }

  /**
   * Unassigns a tool from its current employee, setting `assignedTo` and `assignedOn` to `null`.
   * @private
   * @param {Tool} tool - The tool object to be unassigned.
   * @returns {UnassignResult} An object indicating the success or failure of the unassignment.
   */
  private static unassignFromEmployee(tool: Tool): UnassignResult {
    if (tool.assignedTo == null) {
      return {
        ok: false,
        error: `Tool with ID ${tool.id} is not currently assigned to any employee.`,
      };
    }
    tool.assignedTo = null;
    tool.assignedOn = null;
    return { ok: true, tool };
  }

  /**
   * Resolves and validates the tool and employee IDs provided for an assignment/reassignment operation.
   * @private
   * @param {{ toolId: ToolId; employeeId: EmployeeId }} { toolId, employeeId } - An object containing the tool and employee IDs.
   * @returns {{ error: string; tool?: never; employee?: never } | { error?: never; tool: Tool; employee: Employee }}
   * An object with `error` if validation fails, or `tool` and `employee` objects if successful.
   */
  private resolveAssignmentInputs({
    toolId,
    employeeId,
  }: {
    toolId: ToolId;
    employeeId: EmployeeId;
  }): { error: string; tool?: never; employee?: never } | { error?: never; tool: Tool; employee: Employee } {
    const tool = this.toolById(toolId);
    if (tool == null) {
      return {
        error: `Tool with ID ${toolId} does not exist.`,
      };
    }
    const employee = this.employeeById(employeeId);
    if (employee == null) {
      return {
        error: `Employee with ID ${employeeId} does not exist.`,
      };
    }
    return {
      tool,
      employee,
    };
  }

  /**
   * Type guard to check if the result from `resolveAssignmentInputs` is successful (i.e., contains `tool` and `employee` objects).
   * @private
   * @param {ReturnType<AssignmentService['resolveAssignmentInputs']>} response - The response from `resolveAssignmentInputs`.
   * @returns {boolean} `true` if the response is resolved successfully, `false` otherwise.
   */
  private static isResolved(response: ReturnType<AssignmentService['resolveAssignmentInputs']>): response is {
    tool: Tool;
    employee: Employee;
  } {
    return response.error === undefined;
  }

  /**
   * Assigns a specific tool to an employee.
   * This operation will fail if the tool is already assigned, if the tool or employee does not exist,
   * or if the tool's calibration is overdue. A simulated network delay is applied.
   *
   * @param {{ toolId: ToolId; employeeId: EmployeeId; assignedOn?: ISO8601Date }} { toolId, employeeId, assignedOn } - The ID of the tool, the ID of the employee to assign it to, and optional assignment date.
   * @returns {Promise<AssigmentResult>} A promise that resolves to an `AssigmentResult` indicating success or failure.
   */
  async assignTool({
    toolId,
    employeeId,
    assignedOn,
  }: {
    toolId: ToolId;
    employeeId: EmployeeId;
    assignedOn?: ISO8601Date;
  }): Promise<AssigmentResult> {
    await DataStore.simulateDelay(this.delay);
    const maybeResolved = this.resolveAssignmentInputs({
      toolId,
      employeeId,
    });
    if (!AssignmentService.isResolved(maybeResolved)) {
      return {
        ok: false,
        error: maybeResolved.error,
      };
    }
    const { tool, employee } = maybeResolved;
    if (tool.assignedTo === employeeId) {
      return {
        ok: false,
        error: `Tool with ID ${toolId} is already assigned to employee ${employeeId}.`,
      };
    }
    if (tool.assignedTo != null) {
      return {
        ok: false,
        error: `Tool with ID ${toolId} is already assigned to another employee: ${tool.assignedTo}.`,
      };
    }
    return AssignmentService.assignToEmployee(tool, employee, assignedOn);
  }

  /**
   * Reassigns a tool from its current employee to a new employee.
   * This operation will fail if the tool or new employee does not exist, if the tool is not currently assigned,
   * or if the tool's calibration is overdue. A simulated network delay is applied.
   *
   * @param {{ toolId: ToolId; employeeId: EmployeeId; assignedOn?: ISO8601Date }} { toolId, employeeId, assignedOn } - The ID of the tool, the ID of the new employee, and optional assignment date.
   * @returns {Promise<AssigmentResult>} A promise that resolves to an `AssigmentResult` indicating success or failure.
   */
  async reassignTool({
    toolId,
    employeeId,
    assignedOn,
  }: {
    toolId: ToolId;
    employeeId: EmployeeId;
    assignedOn?: ISO8601Date;
  }): Promise<AssigmentResult> {
    await DataStore.simulateDelay(this.delay);
    const maybeResolved = this.resolveAssignmentInputs({
      toolId,
      employeeId,
    });
    if (!AssignmentService.isResolved(maybeResolved)) {
      return {
        ok: false,
        error: maybeResolved.error,
      };
    }
    const { tool, employee } = maybeResolved;
    if (tool.assignedTo == null) {
      return {
        ok: false,
        error: `Tool with ID ${toolId} is not currently assigned to any employee.`,
      };
    }
    return AssignmentService.assignToEmployee(tool, employee, assignedOn);
  }

  /**
   * Unassigns a specific tool from its currently assigned employee.
   * This operation will fail if the tool does not exist or if it's not currently assigned.
   * A simulated network delay is applied.
   *
   * @param {{ toolId: ToolId }} { toolId } - The ID of the tool to unassign.
   * @returns {Promise<UnassignResult>} A promise that resolves to an `UnassignResult` indicating success or failure.
   */
  async unassignTool({ toolId }: { toolId: ToolId }): Promise<UnassignResult> {
    await DataStore.simulateDelay(this.delay);
    const tool = this.toolById(toolId);
    if (tool == null) {
      return {
        ok: false,
        error: `Tool with ID ${toolId} does not exist.`,
      };
    }
    return AssignmentService.unassignFromEmployee(tool);
  }
}
