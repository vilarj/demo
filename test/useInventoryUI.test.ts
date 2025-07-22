import { act, renderHook } from '@testing-library/react';
import { Tool, ToolType } from '../src/api';
import { useInventoryUI } from '../src/components/hooks/useInventoryUI';
import { IEditingState } from '../src/interfaces/IEditingState';

describe('useInventoryUI', () => {
  const mockTool: Tool = {
    id: 'T1' as `T${number}`,
    type: 'HydraulicWrench' as ToolType,
    model: 'Test Model',
    serialNumber: 'TEST001',
    calibrationDueDate: '2024-01-01',
    assignedTo: null,
    assignedOn: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useInventoryUI());

    expect(result.current.editingState).toBe(null);
    expect(result.current.employeeSearchText).toBe('');
    expect(result.current.unassignModalVisible).toBe(false);
    expect(result.current.selectedTool).toBe(null);
    expect(result.current.inputRef.current).toBe(null);
  });

  it('should update editing state with object', () => {
    const { result } = renderHook(() => useInventoryUI());

    const editingState: IEditingState = {
      toolId: 'T1',
      assignedTo: 'E1',
      assignedOn: '2023-12-01',
      originalAssignedTo: '',
      originalAssignedOn: '',
    };

    act(() => {
      result.current.setEditingState(editingState);
    });

    expect(result.current.editingState).toEqual(editingState);
  });

  it('should update editing state with updater function', () => {
    const { result } = renderHook(() => useInventoryUI());

    const initialState: IEditingState = {
      toolId: 'T1',
      assignedTo: '',
      assignedOn: '',
      originalAssignedTo: '',
      originalAssignedOn: '',
    };

    act(() => {
      result.current.setEditingState(initialState);
    });

    act(() => {
      result.current.setEditingState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          assignedTo: 'E1',
          assignedOn: '2023-12-01',
        };
      });
    });

    expect(result.current.editingState).toEqual({
      toolId: 'T1',
      assignedTo: 'E1',
      assignedOn: '2023-12-01',
      originalAssignedTo: '',
      originalAssignedOn: '',
    });
  });

  it('should handle null editing state with updater function', () => {
    const { result } = renderHook(() => useInventoryUI());

    expect(result.current.editingState).toBe(null);

    act(() => {
      result.current.setEditingState((prev) => {
        if (!prev) return null;
        return { ...prev, assignedTo: 'E1' };
      });
    });

    expect(result.current.editingState).toBe(null);
  });

  it('should clear editing state', () => {
    const { result } = renderHook(() => useInventoryUI());

    const editingState: IEditingState = {
      toolId: 'T1',
      assignedTo: 'E1',
      assignedOn: '2023-12-01',
      originalAssignedTo: '',
      originalAssignedOn: '',
    };

    act(() => {
      result.current.setEditingState(editingState);
    });

    expect(result.current.editingState).toEqual(editingState);

    act(() => {
      result.current.setEditingState(null);
    });

    expect(result.current.editingState).toBe(null);
  });

  it('should update employee search text', () => {
    const { result } = renderHook(() => useInventoryUI());

    act(() => {
      result.current.setEmployeeSearchText('John Doe');
    });

    expect(result.current.employeeSearchText).toBe('John Doe');

    act(() => {
      result.current.setEmployeeSearchText('');
    });

    expect(result.current.employeeSearchText).toBe('');
  });

  it('should toggle unassign modal visibility', () => {
    const { result } = renderHook(() => useInventoryUI());

    expect(result.current.unassignModalVisible).toBe(false);

    act(() => {
      result.current.setUnassignModalVisible(true);
    });

    expect(result.current.unassignModalVisible).toBe(true);

    act(() => {
      result.current.setUnassignModalVisible(false);
    });

    expect(result.current.unassignModalVisible).toBe(false);
  });

  it('should update selected tool', () => {
    const { result } = renderHook(() => useInventoryUI());

    expect(result.current.selectedTool).toBe(null);

    act(() => {
      result.current.setSelectedTool(mockTool);
    });

    expect(result.current.selectedTool).toEqual(mockTool);

    act(() => {
      result.current.setSelectedTool(null);
    });

    expect(result.current.selectedTool).toBe(null);
  });

  it('should focus input with delay', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useInventoryUI());

    // Mock the input ref
    const mockFocus = jest.fn();
    act(() => {
      result.current.inputRef.current = { focus: mockFocus } as any;
    });

    act(() => {
      result.current.focusInput();
    });

    // Fast-forward past the timeout
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockFocus).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('should handle focus input when ref is null', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useInventoryUI());

    // Ensure ref is null
    expect(result.current.inputRef.current).toBe(null);

    // Should not throw error
    act(() => {
      result.current.focusInput();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    jest.useRealTimers();
  });

  it('should reset all UI state', () => {
    const { result } = renderHook(() => useInventoryUI());

    // Set up some state
    const editingState: IEditingState = {
      toolId: 'T1',
      assignedTo: 'E1',
      assignedOn: '2023-12-01',
      originalAssignedTo: '',
      originalAssignedOn: '',
    };

    act(() => {
      result.current.setEditingState(editingState);
      result.current.setEmployeeSearchText('John Doe');
      result.current.setUnassignModalVisible(true);
      result.current.setSelectedTool(mockTool);
    });

    // Verify state is set
    expect(result.current.editingState).toEqual(editingState);
    expect(result.current.employeeSearchText).toBe('John Doe');
    expect(result.current.unassignModalVisible).toBe(true);
    expect(result.current.selectedTool).toEqual(mockTool);

    // Reset UI
    act(() => {
      result.current.resetUI();
    });

    // Verify all state is reset
    expect(result.current.editingState).toBe(null);
    expect(result.current.employeeSearchText).toBe('');
    expect(result.current.unassignModalVisible).toBe(false);
    expect(result.current.selectedTool).toBe(null);
  });

  it('should provide stable function references', () => {
    const { result, rerender } = renderHook(() => useInventoryUI());

    const firstRender = {
      setEditingState: result.current.setEditingState,
      setEmployeeSearchText: result.current.setEmployeeSearchText,
      setUnassignModalVisible: result.current.setUnassignModalVisible,
      setSelectedTool: result.current.setSelectedTool,
      focusInput: result.current.focusInput,
      resetUI: result.current.resetUI,
    };

    rerender();

    expect(result.current.setEditingState).toBe(firstRender.setEditingState);
    expect(result.current.setEmployeeSearchText).toBe(firstRender.setEmployeeSearchText);
    expect(result.current.setUnassignModalVisible).toBe(firstRender.setUnassignModalVisible);
    expect(result.current.setSelectedTool).toBe(firstRender.setSelectedTool);
    expect(result.current.focusInput).toBe(firstRender.focusInput);
    expect(result.current.resetUI).toBe(firstRender.resetUI);
  });

  it('should maintain inputRef across re-renders', () => {
    const { result, rerender } = renderHook(() => useInventoryUI());

    const firstRef = result.current.inputRef;

    rerender();

    expect(result.current.inputRef).toBe(firstRef);
  });

  it('should handle complex editing state updates', () => {
    const { result } = renderHook(() => useInventoryUI());

    // Set initial state
    act(() => {
      result.current.setEditingState({
        toolId: 'T1',
        assignedTo: '',
        assignedOn: '',
        originalAssignedTo: '',
        originalAssignedOn: '',
      });
    });

    // Update multiple fields using updater function
    act(() => {
      result.current.setEditingState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          assignedTo: 'E1',
          assignedOn: '2023-12-01',
          originalAssignedTo: 'E2',
          originalAssignedOn: '2023-11-01',
        };
      });
    });

    expect(result.current.editingState).toEqual({
      toolId: 'T1',
      assignedTo: 'E1',
      assignedOn: '2023-12-01',
      originalAssignedTo: 'E2',
      originalAssignedOn: '2023-11-01',
    });
  });

  it('should allow partial updates to editing state', () => {
    const { result } = renderHook(() => useInventoryUI());

    const initialState: IEditingState = {
      toolId: 'T1',
      assignedTo: 'E1',
      assignedOn: '2023-12-01',
      originalAssignedTo: 'E2',
      originalAssignedOn: '2023-11-01',
    };

    act(() => {
      result.current.setEditingState(initialState);
    });

    // Update only one field
    act(() => {
      result.current.setEditingState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          assignedTo: 'E3',
        };
      });
    });

    expect(result.current.editingState).toEqual({
      ...initialState,
      assignedTo: 'E3',
    });
  });
});
