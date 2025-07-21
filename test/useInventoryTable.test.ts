import { act, renderHook } from '@testing-library/react';
import { useInventoryTable } from '../src/components/hooks/useInventoryTable';

jest.mock('../src/data/employees.json', () => ({}), { virtual: true });
jest.mock('../src/data/tools.json', () => ({}), { virtual: true });

jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('useInventoryTable', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useInventoryTable());

    expect(result.current.activeTab).toBe('all');
    expect(result.current.searchText).toBe('');
    expect(result.current.tools).toEqual([]);
    expect(result.current.pagination.current).toBe(1);
    expect(result.current.pagination.pageSize).toBe(50);
    expect(result.current.pagination.total).toBe(0);
    expect(result.current.editingState).toBe(null);

    expect(typeof result.current.loading).toBe('boolean');
  });

  it('updates active tab', () => {
    const { result } = renderHook(() => useInventoryTable());

    act(() => {
      result.current.setActiveTab('assigned');
    });

    expect(result.current.activeTab).toBe('assigned');
  });

  it('updates search text', () => {
    const { result } = renderHook(() => useInventoryTable());

    act(() => {
      result.current.setSearchText('test search');
    });

    expect(result.current.searchText).toBe('test search');
  });

  it('updates employee search text', () => {
    const { result } = renderHook(() => useInventoryTable());

    act(() => {
      result.current.setEmployeeSearchText('employee search');
    });

    expect(result.current.employeeSearchText).toBe('employee search');
  });

  it('provides editing state functionality', () => {
    const { result } = renderHook(() => useInventoryTable());

    expect(result.current.editingState).toBe(null);
    expect(typeof result.current.handleEdit).toBe('function');
    expect(typeof result.current.handleSave).toBe('function');
    expect(typeof result.current.handleCancel).toBe('function');
  });

  it('provides employee selection functionality', () => {
    const { result } = renderHook(() => useInventoryTable());

    expect(result.current.employeeSearchText).toBe('');
    expect(typeof result.current.handleEmployeeSelect).toBe('function');
    expect(typeof result.current.handleEmployeeSearch).toBe('function');
  });

  it('provides unassign modal functionality', () => {
    const { result } = renderHook(() => useInventoryTable());

    expect(result.current.unassignModalVisible).toBe(false);
    expect(result.current.selectedTool).toBe(null);
    expect(typeof result.current.handleUnassign).toBe('function');
    expect(typeof result.current.handleUnassignConfirm).toBe('function');
    expect(typeof result.current.handleUnassignCancel).toBe('function');
  });

  it('provides sorting functionality', () => {
    const { result } = renderHook(() => useInventoryTable());

    expect(result.current.sortBy).toBe('type');
    expect(result.current.sortOrder).toBe('asc');
    expect(typeof result.current.setSortBy).toBe('function');
    expect(typeof result.current.setSortOrder).toBe('function');
  });

  it('provides date change functionality', () => {
    const { result } = renderHook(() => useInventoryTable());

    expect(typeof result.current.handleDateChange).toBe('function');
  });

  it('provides load functions', () => {
    const { result } = renderHook(() => useInventoryTable());

    expect(typeof result.current.loadTools).toBe('function');
    expect(typeof result.current.loadEmployees).toBe('function');
  });

  it('provides inventory system instance', () => {
    const { result } = renderHook(() => useInventoryTable());

    expect(result.current.inventory).toBeDefined();
    expect(typeof result.current.inventory.getTools).toBe('function');
  });
});
