import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import employeesData from '../../data/employees.json';
import toolsData from '../../data/tools.json';
import { IPaginatedResponse } from '../../interfaces/IPaginatedResponse';
import { Employee, MockInventorySystem, Tool } from '../../inventory-api';
import { TabType } from '../../types/TabType';

const fixToolId = (id: string): `T${number}` => id as `T${number}`;
const fixEmployeeId = (id: string): `E${number}` => id as `E${number}`;

const initialFixedTools: Record<`T${number}`, Tool> = (() => {
  const fixed: Record<`T${number}`, Tool> = {};
  Object.entries(toolsData).forEach(([id, tool]) => {
    fixed[fixToolId(id)] = {
      ...tool,
      id: fixToolId(tool.id) as `T${number}`,
    } as Tool;
  });
  return fixed;
})();

const initialFixedEmployees: Record<`E${number}`, Employee> = (() => {
  const fixed: Record<`E${number}`, Employee> = {};
  Object.entries(employeesData).forEach(([id, emp]) => {
    fixed[fixEmployeeId(id)] = {
      ...emp,
      id: fixEmployeeId(emp.id) as `E${number}`,
    } as Employee;
  });
  return fixed;
})();

export interface UseInventoryDataResult {
  tools: Tool[];
  setTools: (tools: Tool[]) => void;
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  inventory: MockInventorySystem;
  loadTools: (params: {
    page: number;
    pageSize: number;
    activeTab: TabType;
    sortBy: keyof Tool;
    sortOrder: 'asc' | 'desc';
    searchText: string;
  }) => Promise<IPaginatedResponse<Tool>>;
  loadEmployees: () => Promise<void>;
  employeeMap: Record<string, Employee>;
}

/**
 * Hook for managing core inventory data (tools and employees)
 * Handles loading, caching, and providing access to the MockInventorySystem
 */
export function useInventoryData(): UseInventoryDataResult {
  const [tools, setTools] = useState<Tool[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const inventory = useMemo(() => {
    return new MockInventorySystem(initialFixedTools, initialFixedEmployees);
  }, []);

  const loadTools = useCallback(
    async (params: {
      page: number;
      pageSize: number;
      activeTab: TabType;
      sortBy: keyof Tool;
      sortOrder: 'asc' | 'desc';
      searchText: string;
    }) => {
      setLoading(true);
      try {
        const today = dayjs();
        const response: IPaginatedResponse<Tool> = await inventory.getToolsPaginated({
          page: params.page,
          pageSize: params.pageSize,
          filter: params.activeTab,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          search: params.searchText,
        });

        const toolsWithCalibration = response.data.map((tool) => ({
          ...tool,
          calibrationDueIn: dayjs(tool.calibrationDueDate).diff(today, 'day'),
        }));

        setTools(toolsWithCalibration);
        return response;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [inventory],
  );

  const loadEmployees = useCallback(async () => {
    try {
      const apiEmployees = await inventory.getEmployees();
      setEmployees(apiEmployees);
    } catch (error) {
      throw error;
    }
  }, [inventory]);

  const employeeMap: Record<string, Employee> = useMemo(() => {
    return employees.reduce(
      (acc, employee) => {
        acc[employee.id as `E${number}`] = { name: employee.name, id: employee.id as `E${number}` };
        return acc;
      },
      {} as Record<string, Employee>,
    );
  }, [employees]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  return {
    tools,
    setTools,
    employees,
    setEmployees,
    loading,
    setLoading,
    inventory,
    loadTools,
    loadEmployees,
    employeeMap,
  };
}
