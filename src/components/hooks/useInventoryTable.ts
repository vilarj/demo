import { message } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import employeesData from '../../data/employees.json';
import toolsData from '../../data/tools.json';
import { IEditingState } from '../../interfaces/IEditingState';
import { IPaginatedResponse } from '../../interfaces/IPaginatedResponse';
import { Employee, MockInventorySystem, Tool } from '../../inventory-api';
import { TabType } from '../../types/TabType';
import { isCalibrationExpired } from '../CalibrationStatus';

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

/**
 * useInventoryTable is a custom React hook that manages the state and logic for the inventory management table.
 * It handles tool and employee data, assignment operations, searching, sorting, pagination, and UI state for editing and unassigning tools.
 *
 * Features:
 * - Loads and manages tool and employee data from local JSON files via a mock inventory system.
 * - Supports searching, debounced search, sorting, and pagination for tools.
 * - Handles tool assignment, reassignment, and unassignment to employees.
 * - Manages editing state, modal visibility, and input focus for UI interactions.
 * - Provides utility mappings and handlers for table and form components.
 *
 * @returns {object} An object containing state variables, setters, and handler functions for inventory table management:
 *   - activeTab, setActiveTab: Current tab and setter (e.g., 'all', 'assigned', etc.)
 *   - searchText, setSearchText: Search input and setter
 *   - debouncedSearchText: Debounced search value for efficient filtering
 *   - editingState, setEditingState: State for the currently edited tool assignment
 *   - employeeSearchText, setEmployeeSearchText: Search input for employee selection
 *   - unassignModalVisible, setUnassignModalVisible: Modal visibility for unassigning tools
 *   - selectedTool, setSelectedTool: The tool selected for unassignment
 *   - tools, setTools: Array of tools displayed in the table
 *   - employees, setEmployees: Array of employees
 *   - pagination, setPagination: Pagination state and setter
 *   - loading, setLoading: Loading state for async operations
 *   - sortBy, setSortBy: Current sort column and setter
 *   - sortOrder, setSortOrder: Current sort order and setter
 *   - inputRef: Ref for focusing input fields
 *   - inventory: Instance of the mock inventory system
 *   - loadTools, loadEmployees: Functions to reload tool/employee data
 *   - employeeMap: Map of employee IDs to employee objects
 *   - handleEdit: Handler to start editing a tool assignment
 *   - handleUnassign: Handler to start unassigning a tool
 *   - handleSave: Handler to save assignment/reassignment/unassignment
 *   - handleCancel: Handler to cancel editing
 *   - handleUnassignConfirm, handleUnassignCancel: Handlers for unassign modal actions
 *   - handleEmployeeSelect, handleEmployeeSearch: Handlers for employee selection/search
 *   - handleDateChange: Handler for assignment date changes
 */
// Explicitly type the return value for useInventoryTable so destructuring works in consumers
import type { BaseSelectRef } from 'rc-select';
import type { RefObject } from 'react';

export interface UseInventoryTableResult {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  debouncedSearchText: string;
  editingState: IEditingState | null;
  setEditingState: (state: IEditingState | null) => void;
  employeeSearchText: string;
  setEmployeeSearchText: (text: string) => void;
  unassignModalVisible: boolean;
  setUnassignModalVisible: (visible: boolean) => void;
  selectedTool: Tool | null;
  setSelectedTool: (tool: Tool | null) => void;
  tools: Tool[];
  setTools: (tools: Tool[]) => void;
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  setPagination: (pagination: UseInventoryTableResult['pagination']) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  sortBy: keyof Tool;
  setSortBy: (sortBy: keyof Tool) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  inputRef: RefObject<BaseSelectRef>;
  inventory: MockInventorySystem;
  loadTools: (resetPagination?: boolean) => Promise<void>;
  loadEmployees: () => Promise<void>;
  employeeMap: Record<string, Employee>;
  handleEdit: (toolId: string) => Promise<void>;
  handleUnassign: (toolId: string) => Promise<void>;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  handleUnassignConfirm: () => Promise<void>;
  handleUnassignCancel: () => void;
  handleEmployeeSelect: (value: string) => void;
  handleEmployeeSearch: (searchText: string) => void;
  handleDateChange: (date: dayjs.Dayjs | null) => void;
}

export function useInventoryTable(): UseInventoryTableResult {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [editingState, setEditingState] = useState<IEditingState | null>(null);
  const [employeeSearchText, setEmployeeSearchText] = useState('');
  const [unassignModalVisible, setUnassignModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<keyof Tool>('type');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const inputRef = useRef<any>(null);

  const inventory = useMemo(() => {
    return new MockInventorySystem(initialFixedTools, initialFixedEmployees);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const loadTools = useCallback(
    async (resetPagination = false) => {
      setLoading(true);
      try {
        const currentPage = resetPagination ? 1 : pagination.current;
        const today = dayjs();
        const response: IPaginatedResponse<Tool> = await inventory.getToolsPaginated({
          page: currentPage,
          pageSize: pagination.pageSize,
          filter: activeTab,
          sortBy,
          sortOrder,
          search: debouncedSearchText,
        });
        const toolsWithCalibration = response.data.map((tool) => ({
          ...tool,
          calibrationDueIn: dayjs(tool.calibrationDueDate).diff(today, 'day'),
        }));
        setTools(toolsWithCalibration);
        setPagination({
          current: response.pagination.current,
          pageSize: response.pagination.pageSize,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNext,
          hasPrevious: response.pagination.hasPrevious,
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [activeTab, inventory, pagination.current, pagination.pageSize, sortBy, sortOrder, debouncedSearchText],
  );

  const loadEmployees = useCallback(async () => {
    try {
      const apiEmployees = await inventory.getEmployees();
      setEmployees(apiEmployees);
    } catch (error) {}
  }, [inventory]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    loadTools(true);
  }, [activeTab, debouncedSearchText, sortBy, sortOrder]);

  useEffect(() => {
    if (pagination.current !== 1) {
      loadTools(false);
    }
  }, [pagination.current, pagination.pageSize]);

  const employeeMap: Record<string, Employee> = useMemo(() => {
    return employees.reduce(
      (acc, employee) => {
        acc[employee.id as `E${number}`] = { name: employee.name, id: employee.id as `E${number}` };
        return acc;
      },
      {} as Record<string, Employee>,
    );
  }, [employees]);

  const handleEdit = useCallback(
    async (toolId: string) => {
      try {
        const tool = await inventory.getTool(toolId as `T${number}`);
        if (!tool) return;
        const toolWithDays = {
          ...tool,
          calibrationDueIn: dayjs(tool.calibrationDueDate).diff(dayjs(), 'day'),
        };
        if (isCalibrationExpired(toolWithDays.calibrationDueIn)) return;
        setEditingState({
          toolId,
          assignedTo: tool.assignedTo || '',
          assignedOn: tool.assignedOn || dayjs().format('YYYY-MM-DD'),
          originalAssignedTo: tool.assignedTo || '',
          originalAssignedOn: tool.assignedOn || '',
        });
        if (tool.assignedTo) {
          const employee = await inventory.getEmployee(tool.assignedTo);
          if (employee) setEmployeeSearchText(employee.name);
        } else {
          setEmployeeSearchText('');
        }
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } catch (error) {}
    },
    [inventory],
  );

  const handleUnassign = useCallback(
    async (toolId: string) => {
      try {
        const tool = await inventory.getTool(toolId as `T${number}`);
        if (!tool) return;
        setSelectedTool({
          id: tool.id,
          type: tool.type,
          model: tool.model,
          serialNumber: tool.serialNumber,
          calibrationDueDate: tool.calibrationDueDate,
          assignedTo: tool.assignedTo ?? null,
          assignedOn: tool.assignedOn ?? null,
        });
        setUnassignModalVisible(true);
      } catch (error) {}
    },
    [inventory],
  );

  const handleSave = useCallback(async () => {
    if (!editingState) return;
    try {
      const isNewAssignment = !editingState.originalAssignedTo && editingState.assignedTo;
      const isReassignment =
        editingState.originalAssignedTo &&
        editingState.assignedTo &&
        editingState.originalAssignedTo !== editingState.assignedTo;
      const isUnassignment = editingState.originalAssignedTo && !editingState.assignedTo;

      if (isNewAssignment) {
        const result = await inventory.assignTool({
          toolId: editingState.toolId as `T${number}`,
          employeeId: editingState.assignedTo as `E${number}`,
          assignedOn: dayjs(editingState.assignedOn).format('YYYY-MM-DD') as `${number}-${number}-${number}`,
        });
        if (result.ok) {
          message.success('Tool assigned successfully');
        } else {
          return;
        }
      } else if (isReassignment) {
        const result = await inventory.reassignTool({
          toolId: editingState.toolId as `T${number}`,
          employeeId: editingState.assignedTo as `E${number}`,
          assignedOn: dayjs(editingState.assignedOn).format('YYYY-MM-DD') as `${number}-${number}-${number}`,
        });
        if (result.ok) {
          message.success('Tool reassigned successfully');
        } else {
          return;
        }
      } else if (isUnassignment) {
        const result = await inventory.unassignTool({
          toolId: editingState.toolId as `T${number}`,
        });
        if (result.ok) {
          message.success('Tool unassigned successfully');
        } else {
          return;
        }
      }

      setEditingState(null);
      setEmployeeSearchText('');
      await loadTools();
    } catch (error) {}
  }, [editingState, inventory, loadTools]);

  const handleCancel = useCallback((): void => {
    setEditingState(null);
    setEmployeeSearchText('');
  }, []);

  const handleUnassignConfirm = useCallback(async () => {
    if (!selectedTool) return;
    try {
      const result = await inventory.unassignTool({
        toolId: selectedTool.id as `T${number}`,
      });
      if (result.ok) {
        message.success('Tool unassigned successfully');
      }
      setUnassignModalVisible(false);
      setSelectedTool(null);
      await loadTools();
    } catch (error) {}
  }, [selectedTool, inventory, loadTools]);

  const handleUnassignCancel = useCallback((): void => {
    setUnassignModalVisible(false);
    setSelectedTool(null);
  }, []);

  const handleEmployeeSelect = useCallback(
    (value: string) => {
      setEditingState((prevEditingState) => {
        if (!prevEditingState) return null;
        const selectedEmployee = employees.find((emp) => emp.id === value || emp.name === value);
        if (selectedEmployee) {
          setEmployeeSearchText(selectedEmployee.name);
          return {
            ...prevEditingState,
            assignedTo: selectedEmployee.id,
            assignedOn: prevEditingState.assignedOn || dayjs().format('YYYY-MM-DD'),
          };
        }
        return prevEditingState;
      });
    },
    [employees],
  );

  const handleEmployeeSearch = useCallback(
    (searchText: string) => {
      setEmployeeSearchText(searchText);
      setEditingState((prevEditingState) => {
        if (!prevEditingState) return null;
        const employeeById = employees.find((emp) => emp.id === searchText);
        if (employeeById) {
          return {
            ...prevEditingState,
            assignedTo: employeeById.id,
            assignedOn: prevEditingState.assignedOn || dayjs().format('YYYY-MM-DD'),
          };
        }
        const employeeByName = employees.find((emp) => emp.name.toLowerCase() === searchText.toLowerCase());
        if (employeeByName) {
          return {
            ...prevEditingState,
            assignedTo: employeeByName.id,
            assignedOn: prevEditingState.assignedOn || dayjs().format('YYYY-MM-DD'),
          };
        }
        if (!searchText) {
          return {
            ...prevEditingState,
            assignedTo: '',
            assignedOn: prevEditingState.assignedOn || dayjs().format('YYYY-MM-DD'),
          };
        }
        return prevEditingState;
      });
    },
    [employees],
  );

  const handleDateChange = useCallback((date: dayjs.Dayjs | null) => {
    if (!date) return;
    setEditingState((prevEditingState) => {
      if (!prevEditingState) return null;
      return {
        ...prevEditingState,
        assignedOn: date.format('YYYY-MM-DD'),
      };
    });
  }, []);

  return {
    activeTab,
    setActiveTab,
    searchText,
    setSearchText,
    debouncedSearchText,
    editingState,
    setEditingState,
    employeeSearchText,
    setEmployeeSearchText,
    unassignModalVisible,
    setUnassignModalVisible,
    selectedTool,
    setSelectedTool,
    tools,
    setTools,
    employees,
    setEmployees,
    pagination,
    setPagination,
    loading,
    setLoading,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    inputRef,
    inventory,
    loadTools,
    loadEmployees,
    employeeMap,
    handleEdit,
    handleUnassign,
    handleSave,
    handleCancel,
    handleUnassignConfirm,
    handleUnassignCancel,
    handleEmployeeSelect,
    handleEmployeeSearch,
    handleDateChange,
  };
}
