import dayjs from 'dayjs';
import type { BaseSelectRef } from 'rc-select';
import type { RefObject } from 'react';
import { useCallback, useEffect } from 'react';
import { Employee, InventoryAPI, Tool } from '../../api';
import { TabType } from '../../api/types/TabType';
import { IEditingState } from '../../interfaces/IEditingState';
import { useEmployeeSelection } from './useEmployeeSelection';
import { useInventoryData } from './useInventoryData';
import { PaginationState, useInventoryPagination } from './useInventoryPagination';
import { useInventorySearch } from './useInventorySearch';
import { useInventoryUI } from './useInventoryUI';
import { useToolAssignment } from './useToolAssignment';

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
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  sortBy: keyof Tool;
  setSortBy: (sortBy: keyof Tool) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  inputRef: RefObject<BaseSelectRef | null>;
  inventory: InventoryAPI;
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
  // Initialize all sub-hooks
  const searchHook = useInventorySearch();
  const paginationHook = useInventoryPagination();
  const dataHook = useInventoryData();
  const uiHook = useInventoryUI();
  const employeeSelectionHook = useEmployeeSelection();
  const toolAssignmentHook = useToolAssignment();

  // Create load functions that coordinate between hooks
  const loadTools = useCallback(
    async (resetPagination = false) => {
      const currentPage = resetPagination ? 1 : paginationHook.pagination.current;

      if (resetPagination) {
        paginationHook.resetPagination();
      }

      const response = await dataHook.loadTools({
        page: currentPage,
        pageSize: paginationHook.pagination.pageSize,
        activeTab: searchHook.activeTab,
        sortBy: paginationHook.sortBy,
        sortOrder: paginationHook.sortOrder,
        searchText: searchHook.debouncedSearchText,
      });

      paginationHook.setPagination(response.pagination);
    },
    [
      searchHook.activeTab,
      searchHook.debouncedSearchText,
      paginationHook.pagination.current,
      paginationHook.pagination.pageSize,
      paginationHook.sortBy,
      paginationHook.sortOrder,
      dataHook,
      paginationHook,
    ],
  );

  // Create wrapper functions for tool assignment operations
  const handleEdit = useCallback(
    (toolId: string) =>
      toolAssignmentHook.handleEdit(
        toolId,
        dataHook.inventory,
        uiHook.setEditingState,
        uiHook.setEmployeeSearchText,
        uiHook.focusInput,
      ),
    [toolAssignmentHook, dataHook.inventory, uiHook],
  );

  const handleUnassign = useCallback(
    (toolId: string) =>
      toolAssignmentHook.handleUnassign(
        toolId,
        dataHook.inventory,
        uiHook.setSelectedTool,
        uiHook.setUnassignModalVisible,
      ),
    [toolAssignmentHook, dataHook.inventory, uiHook],
  );

  const handleSave = useCallback(
    () =>
      toolAssignmentHook.handleSave(
        uiHook.editingState,
        dataHook.inventory,
        () => {
          uiHook.setEditingState(null);
          uiHook.setEmployeeSearchText('');
        },
        loadTools,
      ),
    [toolAssignmentHook, uiHook, dataHook.inventory, loadTools],
  );

  const handleCancel = useCallback(
    () =>
      toolAssignmentHook.handleCancel(() => {
        uiHook.setEditingState(null);
        uiHook.setEmployeeSearchText('');
      }),
    [toolAssignmentHook, uiHook],
  );

  const handleUnassignConfirm = useCallback(
    () =>
      toolAssignmentHook.handleUnassignConfirm(
        uiHook.selectedTool,
        dataHook.inventory,
        () => {
          uiHook.setUnassignModalVisible(false);
          uiHook.setSelectedTool(null);
        },
        loadTools,
      ),
    [toolAssignmentHook, uiHook, dataHook.inventory, loadTools],
  );

  const handleUnassignCancel = useCallback(
    () =>
      toolAssignmentHook.handleUnassignCancel(() => {
        uiHook.setUnassignModalVisible(false);
        uiHook.setSelectedTool(null);
      }),
    [toolAssignmentHook, uiHook],
  );

  const handleEmployeeSelect = useCallback(
    (value: string) =>
      employeeSelectionHook.handleEmployeeSelect(
        value,
        dataHook.employees,
        uiHook.setEditingState,
        uiHook.setEmployeeSearchText,
      ),
    [employeeSelectionHook, dataHook.employees, uiHook],
  );

  const handleEmployeeSearch = useCallback(
    (searchText: string) =>
      employeeSelectionHook.handleEmployeeSearch(
        searchText,
        dataHook.employees,
        uiHook.setEditingState,
        uiHook.setEmployeeSearchText,
      ),
    [employeeSelectionHook, dataHook.employees, uiHook],
  );

  const handleDateChange = useCallback(
    (date: dayjs.Dayjs | null) => employeeSelectionHook.handleDateChange(date, uiHook.setEditingState),
    [employeeSelectionHook, uiHook],
  );

  // Effects to coordinate data loading
  useEffect(() => {
    loadTools(true);
  }, [searchHook.activeTab, searchHook.debouncedSearchText, paginationHook.sortBy, paginationHook.sortOrder]);

  useEffect(() => {
    if (paginationHook.pagination.current !== 1) {
      loadTools(false);
    }
  }, [paginationHook.pagination.current, paginationHook.pagination.pageSize]);

  // Return the combined interface
  return {
    // Search hook properties
    activeTab: searchHook.activeTab,
    setActiveTab: searchHook.setActiveTab,
    searchText: searchHook.searchText,
    setSearchText: searchHook.setSearchText,
    debouncedSearchText: searchHook.debouncedSearchText,

    // UI hook properties
    editingState: uiHook.editingState,
    setEditingState: uiHook.setEditingState,
    employeeSearchText: uiHook.employeeSearchText,
    setEmployeeSearchText: uiHook.setEmployeeSearchText,
    unassignModalVisible: uiHook.unassignModalVisible,
    setUnassignModalVisible: uiHook.setUnassignModalVisible,
    selectedTool: uiHook.selectedTool,
    setSelectedTool: uiHook.setSelectedTool,
    inputRef: uiHook.inputRef,

    // Data hook properties
    tools: dataHook.tools,
    setTools: dataHook.setTools,
    employees: dataHook.employees,
    setEmployees: dataHook.setEmployees,
    loading: dataHook.loading,
    setLoading: dataHook.setLoading,
    inventory: dataHook.inventory,
    loadEmployees: dataHook.loadEmployees,
    employeeMap: dataHook.employeeMap,

    // Pagination hook properties
    pagination: paginationHook.pagination,
    setPagination: paginationHook.setPagination,
    sortBy: paginationHook.sortBy,
    setSortBy: paginationHook.setSortBy,
    sortOrder: paginationHook.sortOrder,
    setSortOrder: paginationHook.setSortOrder,

    // Coordinated handlers
    loadTools,
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
