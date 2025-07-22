import { IPaginatedResponse } from '../interfaces/IPaginatedResponse';
import { IPaginationOptions } from '../interfaces/IPaginationOptions';
import { EmployeeDirectory } from '../types/EmployeeInventoryType';
import { Tool, ToolId } from '../types/ToolInventoryType';
import { DataStore } from './DataStore';

/**
 * Service for managing tool-related operations.
 * Handles CRUD operations, pagination, filtering, and searching for tools.
 */
export class ToolService extends DataStore {
  private readonly delay: number;

  constructor(tools: Record<string, Tool>, employees: EmployeeDirectory, delay: number = 300) {
    super(tools, employees);
    this.delay = delay;
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
   * @returns {Promise<IPaginatedResponse<Tool>>} A promise that resolves to a paginated response containing tool data and pagination metadata.
   * @throws {Error} If `page` is less than 1 or `pageSize` is not between 1 and 1000.
   */
  async getToolsPaginated(options: IPaginationOptions): Promise<IPaginatedResponse<Tool>> {
    await DataStore.simulateDelay(this.delay);

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
        const aValue = a[sortBy as keyof Tool];
        const bValue = b[sortBy as keyof Tool];

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
      data: paginatedData,
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
   * Retrieves a single tool by its ID.
   * A simulated network delay is applied before returning the data.
   * @param {ToolId} toolId - The ID of the tool to retrieve.
   * @returns {Promise<Tool | null>} A promise that resolves to the tool object if found, otherwise `null`.
   */
  async getTool(toolId: ToolId): Promise<Tool | null> {
    await DataStore.simulateDelay(this.delay);
    const tool = this.toolById(toolId);
    if (tool == null) {
      return null;
    }
    // Return the tool object directly to allow assignment changes to be reflected
    return tool;
  }

  /**
   * Retrieves a list of all tools, optionally filtered by their assignment status.
   * A simulated network delay is applied before returning the data.
   * @param {'all' | 'assigned' | 'available'} [filter='all'] - The filter criterion: 'all', 'assigned', or 'available'.
   * @returns {Promise<Tool[]>} A promise that resolves to an array of tool objects.
   * @throws {Error} If an invalid filter value is provided.
   */
  async getTools(filter?: 'all' | 'assigned' | 'available'): Promise<Tool[]> {
    await DataStore.simulateDelay(this.delay);
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
    // Return the tools directly to allow assignment changes to be reflected
    return matched;
  }

  /**
   * Searches for tools based on a query string across various tool and assigned employee properties.
   * A simulated network delay is applied before returning the data.
   * @param {string} query - The search string.
   * @returns {Promise<Tool[]>} A promise that resolves to an array of tools matching the query.
   */
  async search(query: string): Promise<Tool[]> {
    await DataStore.simulateDelay(this.delay);

    if (!query || query.trim() === '') {
      return [];
    }

    const allTools = Object.values(this.tools);
    const filtered = this.filterTools(allTools, 'all', query);
    // Return the tools directly to allow assignment changes to be reflected
    return filtered;
  }
}
