import { IPaginatedResponse } from './interfaces/IPaginatedResponse';
import { IPaginationOptions } from './interfaces/IPaginationOptions';

export type ToolType = 'HydraulicWrench' | 'PneumaticWrench' | 'Tensioner' | 'TorqueGun' | 'TorqueMultiplier';

type YEAR = number;
type MONTH = number;
type DAY = number;
export type ISO8601Date = `${YEAR}-${MONTH}-${DAY}`;

export type EmployeeId = `E${number}`;
export type Employee = {
  id: EmployeeId;
  name: string;
};

export type ToolId = `T${number}`;
export type Tool = {
  id: ToolId;
  type: ToolType;
  model: string;
  serialNumber: string;
  calibrationDueDate: ISO8601Date;
  assignedTo?: EmployeeId | null;
  assignedOn?: ISO8601Date | null;
};

export type EmployeeDirectory = Record<EmployeeId, Employee>;
export type ToolInventory = Record<ToolId, Tool>;

export type AssigmentResult = { ok: true; tool: Tool } | { ok: false; error: string };
export type UnassignResult = { ok: true; tool: Tool } | { ok: false; error: string };

export class MockInventorySystem {
  private readonly tools: ToolInventory;
  private readonly employees: EmployeeDirectory;
  private readonly delay: number;

  constructor(tools: ToolInventory, employees: EmployeeDirectory, delay = 300) {
    this.tools = structuredClone(tools);
    this.employees = structuredClone(employees);
    this.delay = delay;
  }

  private toolById(toolId: ToolId): Tool | null {
    return this.tools[toolId] ?? null;
  }

  private employeeById(employeeId: EmployeeId): Employee | null {
    return this.employees[employeeId] ?? null;
  }

  private static today(): ISO8601Date {
    return new Date().toISOString().split('T')[0] as ISO8601Date;
  }

  private static assignToEmployee(tool: Tool, employee: Employee): AssigmentResult {
    const today = MockInventorySystem.today();
    if (tool.calibrationDueDate < today) {
      return {
        ok: false,
        error: `Tool with ID ${tool.id} is overdue for calibration and cannot be assigned.`,
      };
    }
    tool.assignedTo = employee.id;
    tool.assignedOn = today;
    return { ok: true, tool };
  }

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

  private static isResolved(response: ReturnType<MockInventorySystem['resolveAssignmentInputs']>): response is {
    tool: Tool;
    employee: Employee;
  } {
    return response.error === undefined;
  }

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

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
        if (bValue == null) return sortOrder === 'asc' ? 1 : -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
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
        return 0;
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

  async assignTool({ toolId, employeeId }: { toolId: ToolId; employeeId: EmployeeId }): Promise<AssigmentResult> {
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
    return MockInventorySystem.assignToEmployee(tool, employee);
  }

  async reassignTool({ toolId, employeeId }: { toolId: ToolId; employeeId: EmployeeId }): Promise<AssigmentResult> {
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
    return MockInventorySystem.assignToEmployee(tool, employee);
  }

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

  async getTool(toolId: ToolId): Promise<Tool | null> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    const tool = this.toolById(toolId);
    if (tool == null) {
      return null;
    }
    return structuredClone(tool);
  }

  async getEmployee(employeeId: EmployeeId): Promise<Employee | null> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    const employee = this.employeeById(employeeId);
    if (employee == null) {
      return null;
    }
    return structuredClone(employee);
  }

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
      throw Error(`invalid filter value ${filter satisfies never}`);
    }
    return structuredClone(matched);
  }

  async getEmployees(): Promise<Employee[]> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });
    return structuredClone(Object.values(this.employees));
  }

  async search(query: string): Promise<Tool[]> {
    await new Promise((resolve) => {
      setTimeout(resolve, this.delay);
    });

    if (!query || query.trim() === '') {
      return [];
    }

    const allTools = Object.values(this.tools);
    const filtered = this.filterTools(allTools, 'all', query);
    return structuredClone(filtered);
  }

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

    return structuredClone(matchedEmployees);
  }
}
