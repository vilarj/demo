import { IPaginatedResponse } from '../interfaces/IPaginatedResponse';
import { IPaginationOptions } from '../interfaces/IPaginationOptions';
import { AssigmentResult, ISO8601Date, UnassignResult } from '../types/AssignmentType';
import { Employee, EmployeeDirectory, EmployeeId } from '../types/EmployeeInventoryType';
import { Tool, ToolId, ToolInventory } from '../types/ToolInventoryType';
import { AssignmentService } from './AssignmentService';
import { CertificateService } from './CertificateService';
import { EmployeeService } from './EmployeeService';
import { ToolService } from './ToolService';

export class InventoryAPI {
  private readonly toolService: ToolService;
  private readonly employeeService: EmployeeService;
  private readonly assignmentService: AssignmentService;
  private readonly certificateService: CertificateService;

  /**
   * Creates an instance of `InventoryAPI`.
   * @param {ToolInventory} tools - An initial set of tools to populate the inventory.
   * @param {EmployeeDirectory} employees - An initial directory of employees.
   * @param {number} [delay=300] - The simulated network delay in milliseconds for API calls.
   */
  constructor(tools: ToolInventory, employees: EmployeeDirectory, delay: number = 300) {
    // Create deep copies once at the API level to share among all services
    const sharedTools = structuredClone(tools);
    const sharedEmployees = structuredClone(employees);

    this.toolService = new ToolService(sharedTools, sharedEmployees, delay);
    this.employeeService = new EmployeeService(sharedTools, sharedEmployees, delay);
    this.assignmentService = new AssignmentService(sharedTools, sharedEmployees, delay);
    this.certificateService = new CertificateService(sharedTools, sharedEmployees, delay);
  }

  // Tool-related methods
  /**
   * Retrieves a paginated list of tools from the inventory, with options for filtering, sorting, and searching.
   * @param {IPaginationOptions} options - Pagination, sorting, filtering, and search options.
   * @returns {Promise<IPaginatedResponse<Tool>>} A promise that resolves to a paginated response containing tool data and pagination metadata.
   */
  async getToolsPaginated(options: IPaginationOptions): Promise<IPaginatedResponse<Tool>> {
    return this.toolService.getToolsPaginated(options);
  }

  /**
   * Retrieves a single tool by its ID.
   * @param {ToolId} toolId - The ID of the tool to retrieve.
   * @returns {Promise<Tool | null>} A promise that resolves to the tool object if found, otherwise `null`.
   */
  async getTool(toolId: ToolId): Promise<Tool | null> {
    return this.toolService.getTool(toolId);
  }

  /**
   * Retrieves a list of all tools, optionally filtered by their assignment status.
   * @param {'all' | 'assigned' | 'available'} [filter='all'] - The filter criterion: 'all', 'assigned', or 'available'.
   * @returns {Promise<Tool[]>} A promise that resolves to an array of tool objects.
   */
  async getTools(filter?: 'all' | 'assigned' | 'available'): Promise<Tool[]> {
    return this.toolService.getTools(filter);
  }

  /**
   * Searches for tools based on a query string across various tool and assigned employee properties.
   * @param {string} query - The search string.
   * @returns {Promise<Tool[]>} A promise that resolves to an array of tools matching the query.
   */
  async search(query: string): Promise<Tool[]> {
    return this.toolService.search(query);
  }

  // Employee-related methods
  /**
   * Retrieves a paginated list of employees from the directory, with options for searching and sorting.
   * @param {object} options - Pagination, sorting, and search options for employees.
   * @returns {Promise<IPaginatedResponse<Employee>>} A promise that resolves to a paginated response containing employee data and pagination metadata.
   */
  async getEmployeesPaginated(options: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: keyof Employee;
    sortOrder?: 'asc' | 'desc';
  }): Promise<IPaginatedResponse<Employee>> {
    return this.employeeService.getEmployeesPaginated(options);
  }

  /**
   * Retrieves a single employee by their ID.
   * @param {EmployeeId} employeeId - The ID of the employee to retrieve.
   * @returns {Promise<Employee | null>} A promise that resolves to the employee object if found, otherwise `null`.
   */
  async getEmployee(employeeId: EmployeeId): Promise<Employee | null> {
    return this.employeeService.getEmployee(employeeId);
  }

  /**
   * Retrieves a list of all employees in the directory.
   * @returns {Promise<Employee[]>} A promise that resolves to an array of employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    return this.employeeService.getEmployees();
  }

  /**
   * Searches for employees based on a query string across their names and IDs.
   * @param {string} query - The search string.
   * @returns {Promise<Employee[]>} A promise that resolves to an array of employees matching the query.
   */
  async searchEmployees(query: string): Promise<Employee[]> {
    return this.employeeService.searchEmployees(query);
  }

  // Assignment-related methods
  /**
   * Assigns a specific tool to an employee.
   * @param {{ toolId: ToolId; employeeId: EmployeeId; assignedOn?: ISO8601Date }} params - Assignment parameters.
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
    return this.assignmentService.assignTool({ toolId, employeeId, ...(assignedOn && { assignedOn }) });
  }

  /**
   * Reassigns a tool from its current employee to a new employee.
   * @param {{ toolId: ToolId; employeeId: EmployeeId; assignedOn?: ISO8601Date }} params - Reassignment parameters.
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
    return this.assignmentService.reassignTool({ toolId, employeeId, ...(assignedOn && { assignedOn }) });
  }

  /**
   * Unassigns a specific tool from its currently assigned employee.
   * @param {{ toolId: ToolId }} params - Unassignment parameters.
   * @returns {Promise<UnassignResult>} A promise that resolves to an `UnassignResult` indicating success or failure.
   */
  async unassignTool({ toolId }: { toolId: ToolId }): Promise<UnassignResult> {
    return this.assignmentService.unassignTool({ toolId });
  }

  // Certificate-related methods
  /**
   * Generates and downloads a calibration certificate for a specific tool as a PDF.
   * @param {ToolId} toolId - The ID of the tool to generate the certificate for.
   * @returns {Promise<{ ok: true; pdfBlob: Blob; filename: string } | { ok: false; error: string }>}
   */
  async downloadCalibrationCertificate(
    toolId: ToolId,
  ): Promise<{ ok: true; pdfBlob: Blob; filename: string } | { ok: false; error: string }> {
    return this.certificateService.downloadCalibrationCertificate(toolId);
  }
}
