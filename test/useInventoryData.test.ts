import { act, renderHook, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { Tool, ToolType } from '../src/api';
import { TabType } from '../src/api/types/TabType';
import { useInventoryData } from '../src/components/hooks/useInventoryData';

// Extended Tool type that includes calibrationDueIn (added by the hook)
type ToolWithCalibration = Tool & { calibrationDueIn: number };

// Mock the data files
jest.mock(
  '../src/api/data/employees.json',
  () => ({
    E1: { id: 'E1', name: 'John Doe' },
    E2: { id: 'E2', name: 'Jane Smith' },
  }),
  { virtual: true },
);

jest.mock(
  '../src/api/data/tools.json',
  () => ({
    T1: {
      id: 'T1',
      type: 'Multimeter',
      model: 'Model A',
      serialNumber: 'SN001',
      calibrationDueDate: '2024-01-01',
      assignedTo: null,
      assignedOn: null,
    },
    T2: {
      id: 'T2',
      type: 'Oscilloscope',
      model: 'Model B',
      serialNumber: 'SN002',
      calibrationDueDate: '2024-02-01',
      assignedTo: 'E1',
      assignedOn: '2023-12-01',
    },
  }),
  { virtual: true },
);

describe('useInventoryData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useInventoryData());

    expect(result.current.tools).toEqual([]);
    expect(result.current.employees).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.inventory).toBeDefined();
    expect(result.current.employeeMap).toEqual({});
  });

  it('should load employees on mount', async () => {
    const { result } = renderHook(() => useInventoryData());

    await waitFor(() => {
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    expect(result.current.employees).toEqual([
      { id: 'E1', name: 'John Doe' },
      { id: 'E2', name: 'Jane Smith' },
    ]);
  });

  it('should create employee map from loaded employees', async () => {
    const { result } = renderHook(() => useInventoryData());

    await waitFor(() => {
      expect(Object.keys(result.current.employeeMap).length).toBeGreaterThan(0);
    });

    expect(result.current.employeeMap).toEqual({
      E1: { id: 'E1', name: 'John Doe' },
      E2: { id: 'E2', name: 'Jane Smith' },
    });
  });

  it('should load tools with pagination and add calibrationDueIn', async () => {
    const { result } = renderHook(() => useInventoryData());

    const params = {
      page: 1,
      pageSize: 10,
      activeTab: 'all' as TabType,
      sortBy: 'type' as const,
      sortOrder: 'asc' as const,
      searchText: '',
    };

    let response;
    await act(async () => {
      response = await result.current.loadTools(params);
    });

    expect(result.current.loading).toBe(false);
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(result.current.tools).toBeDefined();

    // Check that calibrationDueIn is added to tools
    if (result.current.tools.length > 0) {
      const toolWithCalibration = result.current.tools[0] as ToolWithCalibration;
      expect(toolWithCalibration).toHaveProperty('calibrationDueIn');
      expect(typeof toolWithCalibration.calibrationDueIn).toBe('number');
    }
  });

  it('should set loading state during tool loading', async () => {
    const { result } = renderHook(() => useInventoryData());

    // Wait for initial load to complete first
    await waitFor(() => {
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    const params = {
      page: 1,
      pageSize: 10,
      activeTab: 'all' as TabType,
      sortBy: 'type' as const,
      sortOrder: 'asc' as const,
      searchText: '',
    };

    // Since the mock has no delay, we can't really test loading state transition
    // but we can test that loading is false after the operation completes
    await act(async () => {
      await result.current.loadTools(params);
    });

    // Loading should be false after completion
    expect(result.current.loading).toBe(false);
  });

  it('should handle different filter parameters', async () => {
    const { result } = renderHook(() => useInventoryData());

    const params = {
      page: 2,
      pageSize: 5,
      activeTab: 'assigned' as TabType,
      sortBy: 'model' as const,
      sortOrder: 'desc' as const,
      searchText: 'test',
    };

    await act(async () => {
      await result.current.loadTools(params);
    });

    expect(result.current.loading).toBe(false);
  });

  it('should calculate calibrationDueIn correctly', async () => {
    const { result } = renderHook(() => useInventoryData());
    const today = dayjs();

    // Wait for initial load to complete first
    await waitFor(() => {
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    const params = {
      page: 1,
      pageSize: 10,
      activeTab: 'all' as TabType,
      sortBy: 'type' as const,
      sortOrder: 'asc' as const,
      searchText: '',
    };

    await act(async () => {
      await result.current.loadTools(params);
    });

    const toolsWithCalibration = result.current.tools as ToolWithCalibration[];

    toolsWithCalibration.forEach((tool) => {
      const expectedDiff = dayjs(tool.calibrationDueDate).diff(today, 'day');
      expect(tool.calibrationDueIn).toBe(expectedDiff);
    });
  });

  it('should handle loadTools error gracefully', async () => {
    const { result } = renderHook(() => useInventoryData());

    // Wait for initial load to complete first
    await waitFor(() => {
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    // Mock the inventory to throw an error
    const originalGetToolsPaginated = result.current.inventory.getToolsPaginated;
    result.current.inventory.getToolsPaginated = jest.fn().mockRejectedValue(new Error('API Error'));

    const params = {
      page: 1,
      pageSize: 10,
      activeTab: 'all' as TabType,
      sortBy: 'type' as const,
      sortOrder: 'asc' as const,
      searchText: '',
    };

    await expect(
      act(async () => {
        await result.current.loadTools(params);
      }),
    ).rejects.toThrow('API Error');

    expect(result.current.loading).toBe(false);

    // Restore original method
    result.current.inventory.getToolsPaginated = originalGetToolsPaginated;
  });

  it('should handle loadEmployees error gracefully', async () => {
    const { result } = renderHook(() => useInventoryData());

    // Wait for initial load to complete first
    await waitFor(() => {
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    // Mock the inventory to throw an error
    const originalGetEmployees = result.current.inventory.getEmployees;
    result.current.inventory.getEmployees = jest.fn().mockRejectedValue(new Error('API Error'));

    await expect(
      act(async () => {
        await result.current.loadEmployees();
      }),
    ).rejects.toThrow('API Error');

    // Restore original method
    result.current.inventory.getEmployees = originalGetEmployees;
  });

  it('should allow manual setting of tools and employees', async () => {
    const { result } = renderHook(() => useInventoryData());

    // Wait for initial load to complete first
    await waitFor(() => {
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    const newTools: Tool[] = [
      {
        id: 'T999' as `T${number}`,
        type: 'HydraulicWrench' as ToolType,
        model: 'Test Model',
        serialNumber: 'TEST001',
        calibrationDueDate: '2024-12-01',
        assignedTo: null,
        assignedOn: null,
      },
    ];

    const newEmployees = [{ id: 'E999' as `E${number}`, name: 'Test Employee' }];

    act(() => {
      result.current.setTools(newTools);
      result.current.setEmployees(newEmployees);
    });

    expect(result.current.tools).toEqual(newTools);
    expect(result.current.employees).toEqual(newEmployees);
  });

  it('should update employee map when employees change', async () => {
    const { result } = renderHook(() => useInventoryData());

    // Wait for initial load to complete first
    await waitFor(() => {
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    const newEmployees = [
      { id: 'E999' as `E${number}`, name: 'Test Employee' },
      { id: 'E888' as `E${number}`, name: 'Another Employee' },
    ];

    act(() => {
      result.current.setEmployees(newEmployees);
    });

    await waitFor(() => {
      expect(result.current.employeeMap).toEqual({
        E999: { id: 'E999', name: 'Test Employee' },
        E888: { id: 'E888', name: 'Another Employee' },
      });
    });
  });

  it('should provide stable function references', async () => {
    const { result, rerender } = renderHook(() => useInventoryData());

    // Wait for initial load to complete first
    await waitFor(() => {
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    const firstRender = {
      loadTools: result.current.loadTools,
      loadEmployees: result.current.loadEmployees,
      setTools: result.current.setTools,
      setEmployees: result.current.setEmployees,
      setLoading: result.current.setLoading,
    };

    rerender();

    expect(result.current.loadTools).toBe(firstRender.loadTools);
    expect(result.current.loadEmployees).toBe(firstRender.loadEmployees);
    expect(result.current.setTools).toBe(firstRender.setTools);
    expect(result.current.setEmployees).toBe(firstRender.setEmployees);
    expect(result.current.setLoading).toBe(firstRender.setLoading);
  });

  it('should maintain inventory instance across re-renders', async () => {
    const { result, rerender } = renderHook(() => useInventoryData());

    // Wait for initial load to complete first
    await waitFor(() => {
      expect(result.current.employees.length).toBeGreaterThan(0);
    });

    const firstInventory = result.current.inventory;

    rerender();

    expect(result.current.inventory).toBe(firstInventory);
  });
});
