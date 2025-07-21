import { IPaginatedResponse } from './interfaces/IPaginatedResponse';
import { IPaginationOptions } from './interfaces/IPaginationOptions';

/**
 * Defines the possible types of tools in the inventory system.
 */
export type ToolType = 'HydraulicWrench' | 'PneumaticWrench' | 'Tensioner' | 'TorqueGun' | 'TorqueMultiplier';

// Type aliases for date components to enhance readability for ISO8601Date.
type YEAR = number;
type MONTH = number;
type DAY = number;

/**
 * Represents a date string in ISO 8601 format (YYYY-MM-DD).
 * @example "2024-07-21"
 */
export type ISO8601Date = `${YEAR}-${MONTH}-${DAY}`;

/**
 * Represents a unique identifier for an employee.
 * @example "E12345"
 */
export type EmployeeId = `E${number}`;

/**
 * Represents an employee in the system.
 */
export type Employee = {
  /** The unique ID of the employee. */
  id: EmployeeId;
  /** The full name of the employee. */
  name: string;
};

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
 * A dictionary-like type where keys are `EmployeeId` and values are `Employee` objects.
 * This provides quick lookup for employee details by their ID.
 */
export type EmployeeDirectory = Record<EmployeeId, Employee>;

/**
 * A dictionary-like type where keys are `ToolId` and values are `Tool` objects.
 * This provides quick lookup for tool details by their ID.
 */
export type ToolInventory = Record<ToolId, Tool>;

/**
 * Represents the result of an assignment operation.
 * Can be `ok: true` with the updated `tool` object on success,
 * or `ok: false` with an `error` message on failure.
 */
export type AssigmentResult = { ok: true; tool: Tool } | { ok: false; error: string };

/**
 * Represents the result of an unassignment operation.
 * Can be `ok: true` with the updated `tool` object on success,
 * or `ok: false` with an `error` message on failure.
 */
export type UnassignResult = { ok: true; tool: Tool } | { ok: false; error: string };

/**
 * `MockInventorySystem` simulates a backend inventory system for managing tools and employees.
 * It provides methods for retrieving, assigning, reassigning, and unassigning tools,
 * with support for pagination, sorting, and filtering. All operations include a simulated
 * network delay.
 */
export class MockInventorySystem {
  private readonly tools: ToolInventory;
  private readonly employees: EmployeeDirectory;
  private readonly delay: number;

  /**
   * Creates an instance of `MockInventorySystem`.
   * @param {ToolInventory} tools - An initial set of tools to populate the inventory.
   * @param {EmployeeDirectory} employees - An initial directory of employees.
   * @param {number} [delay=300] - The simulated network delay in milliseconds for API calls.
   */
  constructor(tools: ToolInventory, employees: EmployeeDirectory, delay = 300) {
    // Use structuredClone to create deep copies to prevent external modification of initial data.
    this.tools = structuredClone(tools);
    this.employees = structuredClone(employees);
    this.delay = delay;
  }

  /**
   * Retrieves a tool by its ID from the internal inventory.
   * @private
   * @param {ToolId} toolId - The ID of the tool to retrieve.
   * @returns {Tool | null} The tool object if found, otherwise `null`.
   */
  private toolById(toolId: ToolId): Tool | null {
    return this.tools[toolId] ?? null;
  }

  /**
   * Retrieves an employee by their ID from the internal directory.
   * @private
   * @param {EmployeeId} employeeId - The ID of the employee to retrieve.
   * @returns {Employee | null} The employee object if found, otherwise `null`.
   */
  private employeeById(employeeId: EmployeeId): Employee | null {
    return this.employees[employeeId] ?? null;
  }

  /**
   * Returns today's date in ISO 8601 (YYYY-MM-DD) format.
   * @private
   * @returns {ISO8601Date} The current date as an ISO 8601 string.
   */
  private static today(): ISO8601Date {
    return new Date().toISOString().split('T')[0] as ISO8601Date;
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
    const today = MockInventorySystem.today();
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
   * @param {ReturnType<MockInventorySystem['resolveAssignmentInputs']>} response - The response from `resolveAssignmentInputs`.
   * @returns {boolean} `true` if the response is resolved successfully, `false` otherwise.
   */
  private static isResolved(response: ReturnType<MockInventorySystem['resolveAssignmentInputs']>): response is {
    tool: Tool;
    employee: Employee;
  } {
    return response.error === undefined;
  }

  /**
   * Filters a list of tools based on their assignment status and a search query.
   * @private
   * @param {Tool[]} tools - The array of tools to filter.
   * @param {'all' | 'assigned' | 'available'} [filter='all'] - The filter criterion: 'all', 'assigned', or 'available'.
   * @param {string} [search] - A search string to match against tool properties (type, model, serial number, ID)
   * or assigned employee properties (name, ID).
   * @returns {Tool[]} The array of filtered tools.
   */
  private filterTools(tools: Tool[], filter?: 'all' | 'assigned' | 'available', search?: string): Tool[] {
    let filtered: Tool[] = tools;

    if (filter === 'assigned') {
      filtered = filtered.filter((tool) => !!tool.assignedTo);
    } else if (filter === 'available') {
      filtered = filtered.filter((tool) => !tool.assignedTo);
    }

    if (search && search.trim() !== '') {
      const searchQuery = search.toLowerCase().trim();
      filtered = filtered.filter((tool) => {
        const toolMatches =
          tool.type.toLowerCase().includes(searchQuery) ||
          tool.model.toLowerCase().includes(searchQuery) ||
          tool.serialNumber.toLowerCase().includes(searchQuery) ||
          tool.id.toLowerCase().includes(searchQuery);

        let employeeMatches = false;
        if (tool.assignedTo) {
          const employee = this.employees[tool.assignedTo];
          if (employee) {
            employeeMatches =
              employee.name.toLowerCase().includes(searchQuery) || employee.id.toLowerCase().includes(searchQuery);
          }
        }

        return toolMatches || employeeMatches;
      });
    }

    return filtered;
  }

  /**
   * Retrieves a paginated list of tools from the inventory, with options for filtering, sorting, and searching.
   * A simulated network delay is applied before returning the data.
   *
   * @param {IPaginationOptions} options - Pagination, sorting, filtering, and search options.
   * @param {number} options.page - The current page number (1-indexed).
   * @param {number} options.pageSize - The number of items per page.
   * @param {'all' | 'assigned' | 'available'} [options.filter='all'] - Filters tools by their assignment status.
   * @param {keyof Tool} [options.sortBy] - The tool property to sort by (e.g., 'type', 'model', 'calibrationDueDate').
   * @param {'asc' | 'desc'} [options.sortOrder='asc'] - The sorting order ('asc' for ascending, 'desc' for descending).
   * @param {string} [options.search] - A search string to filter tools by type, model, serial number, or assigned employee.
   * @returns {Promise<IPaginatedResponse<Tool>>} A promise that resolves to a paginated response containing tool data and pagination metadata.
   * @throws {Error} If `page` is less than 1 or `pageSize` is not between 1 and 1000.
   */
  async getToolsPaginated(options: IPaginationOptions): Promise<IPaginatedResponse<Tool>> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });

    const { page, pageSize, filter = 'all', sortBy, sortOrder = 'asc', search } = options;

    if (page < 1) {
      throw new Error('Page number must be greater than 0');
    }
    if (pageSize < 1 || pageSize > 1000) {
      throw new Error('Page size must be between 1 and 1000');
    }

    let allTools = Object.values(this.tools);

    const filteredTools = this.filterTools(allTools, filter, search);

    if (sortBy) {
      filteredTools.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        // Handle null/undefined values for sorting
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === 'asc' ? -1 : 1; // Nulls come first in asc, last in desc
        if (bValue == null) return sortOrder === 'asc' ? 1 : -1; // Nulls come first in asc, last in desc

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0; // Fallback for other types or if types don't match
      });
    }

    const total = filteredTools.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = filteredTools.slice(start, end);

    return {
      data: structuredClone(paginatedData),
      pagination: {
        current: page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Retrieves a paginated list of employees from the directory, with options for searching and sorting.
   * A simulated network delay is applied before returning the data.
   *
   * @param {object} options - Pagination, sorting, and search options for employees.
   * @param {number} options.page - The current page number (1-indexed).
   * @param {number} options.pageSize - The number of items per page.
   * @param {string} [options.search] - A search string to filter employees by name or ID.
   * @param {keyof Employee} [options.sortBy] - The employee property to sort by (e.g., 'name', 'id').
   * @param {'asc' | 'desc'} [options.sortOrder='asc'] - The sorting order ('asc' for ascending, 'desc' for descending).
   * @returns {Promise<IPaginatedResponse<Employee>>} A promise that resolves to a paginated response containing employee data and pagination metadata.
   * @throws {Error} If `page` is less than 1 or `pageSize` is not between 1 and 1000.
   */
  async getEmployeesPaginated(options: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: keyof Employee;
    sortOrder?: 'asc' | 'desc';
  }): Promise<IPaginatedResponse<Employee>> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });

    const { page, pageSize, search, sortBy, sortOrder = 'asc' } = options;

    if (page < 1) {
      throw new Error('Page number must be greater than 0');
    }
    if (pageSize < 1 || pageSize > 1000) {
      throw new Error('Page size must be between 1 and 1000');
    }

    let allEmployees = Object.values(this.employees);

    if (search && search.trim() !== '') {
      const searchQuery = search.toLowerCase().trim();
      allEmployees = allEmployees.filter((employee) => {
        return employee.name.toLowerCase().includes(searchQuery) || employee.id.toLowerCase().includes(searchQuery);
      });
    }

    if (sortBy) {
      allEmployees.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0; // Should not happen with current sortBy options
      });
    }

    const total = allEmployees.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = allEmployees.slice(start, end);

    return {
      data: structuredClone(paginatedData),
      pagination: {
        current: page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
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
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    const maybeResolved = this.resolveAssignmentInputs({
      toolId,
      employeeId,
    });
    if (!MockInventorySystem.isResolved(maybeResolved)) {
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
    return MockInventorySystem.assignToEmployee(tool, employee, assignedOn);
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
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    const maybeResolved = this.resolveAssignmentInputs({
      toolId,
      employeeId,
    });
    if (!MockInventorySystem.isResolved(maybeResolved)) {
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
    return MockInventorySystem.assignToEmployee(tool, employee, assignedOn);
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
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    const tool = this.toolById(toolId);
    if (tool == null) {
      return {
        ok: false,
        error: `Tool with ID ${toolId} does not exist.`,
      };
    }
    return MockInventorySystem.unassignFromEmployee(tool);
  }

  /**
   * Retrieves a single tool by its ID.
   * A simulated network delay is applied before returning the data.
   * @param {ToolId} toolId - The ID of the tool to retrieve.
   * @returns {Promise<Tool | null>} A promise that resolves to the tool object if found, otherwise `null`.
   */
  async getTool(toolId: ToolId): Promise<Tool | null> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    const tool = this.toolById(toolId);
    if (tool == null) {
      return null;
    }
    // Return a structured clone to prevent direct modification of internal state
    return structuredClone(tool);
  }

  /**
   * Retrieves a single employee by their ID.
   * A simulated network delay is applied before returning the data.
   * @param {EmployeeId} employeeId - The ID of the employee to retrieve.
   * @returns {Promise<Employee | null>} A promise that resolves to the employee object if found, otherwise `null`.
   */
  async getEmployee(employeeId: EmployeeId): Promise<Employee | null> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    const employee = this.employeeById(employeeId);
    if (employee == null) {
      return null;
    }
    // Return a structured clone to prevent direct modification of internal state
    return structuredClone(employee);
  }

  /**
   * Retrieves a list of all tools, optionally filtered by their assignment status.
   * A simulated network delay is applied before returning the data.
   * @param {'all' | 'assigned' | 'available'} [filter='all'] - The filter criterion: 'all', 'assigned', or 'available'.
   * @returns {Promise<Tool[]>} A promise that resolves to an array of tool objects.
   * @throws {Error} If an invalid filter value is provided.
   */
  async getTools(filter?: 'all' | 'assigned' | 'available'): Promise<Tool[]> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    let matched: Tool[];
    if (filter === 'all' || !filter) {
      matched = Object.values(this.tools);
    } else if (filter === 'assigned') {
      matched = Object.values(this.tools).filter((tool) => !!tool.assignedTo);
    } else if (filter === 'available') {
      matched = Object.values(this.tools).filter((tool) => !tool.assignedTo);
    } else {
      // This case should ideally be caught by TypeScript's type checking with 'never'
      throw Error(`invalid filter value ${filter satisfies never}`);
    }
    // Return a structured clone to prevent direct modification of internal state
    return structuredClone(matched);
  }

  /**
   * Retrieves a list of all employees in the directory.
   * A simulated network delay is applied before returning the data.
   * @returns {Promise<Employee[]>} A promise that resolves to an array of employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    // Return a structured clone to prevent direct modification of internal state
    return structuredClone(Object.values(this.employees));
  }

  /**
   * Searches for tools based on a query string across various tool and assigned employee properties.
   * A simulated network delay is applied before returning the data.
   * @param {string} query - The search string.
   * @returns {Promise<Tool[]>} A promise that resolves to an array of tools matching the query.
   */
  async search(query: string): Promise<Tool[]> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });

    if (!query || query.trim() === '') {
      return [];
    }

    const allTools = Object.values(this.tools);
    const filtered = this.filterTools(allTools, 'all', query);
    // Return a structured clone to prevent direct modification of internal state
    return structuredClone(filtered);
  }

  /**
   * Searches for employees based on a query string across their names and IDs.
   * If the query is empty, all employees are returned. A simulated network delay is applied.
   * @param {string} query - The search string.
   * @returns {Promise<Employee[]>} A promise that resolves to an array of employees matching the query.
   */
  async searchEmployees(query: string): Promise<Employee[]> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });

    if (!query || query.trim() === '') {
      return structuredClone(Object.values(this.employees));
    }

    const searchQuery = query.toLowerCase().trim();
    const allEmployees = Object.values(this.employees);

    const matchedEmployees = allEmployees.filter((employee) => {
      return employee.name.toLowerCase().includes(searchQuery) || employee.id.toLowerCase().includes(searchQuery);
    });

    // Return a structured clone to prevent direct modification of internal state
    return structuredClone(matchedEmployees);
  }

  /**
   * Generates and downloads a calibration certificate for a specific tool as a PDF.
   * A simulated network delay is applied before returning the certificate data.
   * @param {ToolId} toolId - The ID of the tool to generate the certificate for.
   * @returns {Promise<{ ok: true; pdfBlob: Blob; filename: string } | { ok: false; error: string }>}
   * A promise that resolves to either a success object with PDF blob data and filename, or an error object.
   */
  async downloadCalibrationCertificate(
    toolId: ToolId,
  ): Promise<{ ok: true; pdfBlob: Blob; filename: string } | { ok: false; error: string }> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });

    const tool = this.toolById(toolId);
    if (tool == null) {
      return {
        ok: false,
        error: `Tool with ID ${toolId} does not exist.`,
      };
    }

    // Simulate PDF generation on the backend
    const pdfContent = this.generatePDFContent(tool);
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
    const filename = `Calibration_Certificate_${tool.id}_${tool.calibrationDueDate}.pdf`;

    return {
      ok: true,
      pdfBlob,
      filename,
    };
  }

  /**
   * Generates mock PDF content for a calibration certificate.
   * In a real implementation, this would use a proper PDF generation library on the backend.
   * @private
   * @param {Tool} tool - The tool to generate the certificate for.
   * @returns {string} Mock PDF content as a string.
   */
  private generatePDFContent(tool: Tool): string {
    const assignedEmployee = tool.assignedTo ? this.employees[tool.assignedTo] : null;
    const assignedTo = assignedEmployee ? assignedEmployee.name : 'Unassigned';

    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 400
>>
stream
BT
/F1 12 Tf
50 750 Td
(CALIBRATION CERTIFICATE) Tj
0 -30 Td
(Tool ID: ${tool.id}) Tj
0 -20 Td
(Tool Type: ${tool.type}) Tj
0 -20 Td
(Model: ${tool.model}) Tj
0 -20 Td
(Serial Number: ${tool.serialNumber}) Tj
0 -20 Td
(Calibration Due Date: ${tool.calibrationDueDate}) Tj
0 -20 Td
(Assigned To: ${assignedTo}) Tj
0 -30 Td
(This certificate confirms that the above tool has been calibrated) Tj
0 -20 Td
(according to applicable standards and procedures.) Tj
0 -30 Td
(Generated on: ${MockInventorySystem.today()}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000262 00000 n 
0000000713 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
792
%%EOF`;
  }
}
