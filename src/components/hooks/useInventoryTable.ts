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

export function useInventoryTable() {
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
            assignedOn: prevEditingState.originalAssignedTo
              ? prevEditingState.assignedOn
              : dayjs().format('YYYY-MM-DD'),
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
            assignedOn: prevEditingState.originalAssignedTo
              ? prevEditingState.assignedOn
              : dayjs().format('YYYY-MM-DD'),
          };
        }
        const employeeByName = employees.find((emp) => emp.name.toLowerCase() === searchText.toLowerCase());
        if (employeeByName) {
          return {
            ...prevEditingState,
            assignedTo: employeeByName.id,
            assignedOn: prevEditingState.originalAssignedTo
              ? prevEditingState.assignedOn
              : dayjs().format('YYYY-MM-DD'),
          };
        }
        if (!searchText) {
          return {
            ...prevEditingState,
            assignedTo: '',
            assignedOn: prevEditingState.originalAssignedOn,
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
