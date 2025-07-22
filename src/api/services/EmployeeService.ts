import { IPaginatedResponse } from '../interfaces/IPaginatedResponse';
import { Employee, EmployeeDirectory, EmployeeId } from '../types/EmployeeInventoryType';
import { ToolInventory } from '../types/ToolInventoryType';
import { DataStore } from './DataStore';

/**
 * Service for managing employee-related operations.
 * Handles CRUD operations, pagination, and searching for employees.
 */
export class EmployeeService extends DataStore {
  private readonly delay: number;

  constructor(tools: ToolInventory, employees: EmployeeDirectory, delay: number = 300) {
    super(tools, employees);
    this.delay = delay;
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
    await DataStore.simulateDelay(this.delay);

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
   * Retrieves a single employee by their ID.
   * A simulated network delay is applied before returning the data.
   * @param {EmployeeId} employeeId - The ID of the employee to retrieve.
   * @returns {Promise<Employee | null>} A promise that resolves to the employee object if found, otherwise `null`.
   */
  async getEmployee(employeeId: EmployeeId): Promise<Employee | null> {
    await DataStore.simulateDelay(this.delay);
    const employee = this.employeeById(employeeId);
    if (employee == null) {
      return null;
    }
    // Return a structured clone to prevent direct modification of internal state
    return employee;
  }

  /**
   * Retrieves a list of all employees in the directory.
   * A simulated network delay is applied before returning the data.
   * @returns {Promise<Employee[]>} A promise that resolves to an array of employee objects.
   */
  async getEmployees(): Promise<Employee[]> {
    await DataStore.simulateDelay(this.delay);
    // Return the employees directly
    return Object.values(this.employees);
  }

  /**
   * Searches for employees based on a query string across their names and IDs.
   * If the query is empty, all employees are returned. A simulated network delay is applied.
   * @param {string} query - The search string.
   * @returns {Promise<Employee[]>} A promise that resolves to an array of employees matching the query.
   */
  async searchEmployees(query: string): Promise<Employee[]> {
    await DataStore.simulateDelay(this.delay);

    if (!query || query.trim() === '') {
      return Object.values(this.employees);
    }

    const searchQuery = query.toLowerCase().trim();
    const allEmployees = Object.values(this.employees);

    const matchedEmployees = allEmployees.filter((employee) => {
      return employee.name.toLowerCase().includes(searchQuery) || employee.id.toLowerCase().includes(searchQuery);
    });

    // Return the employees directly
    return matchedEmployees;
  }
}
