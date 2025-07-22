import { act, renderHook } from '@testing-library/react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { Employee, InventoryAPI, Tool } from '../src/api';
import { isCalibrationExpired } from '../src/components/CalibrationStatus';
import { useToolAssignment } from '../src/components/hooks/useToolAssignment';
import { IEditingState } from '../src/interfaces/IEditingState';

// Mock antd message
jest.mock('antd', () => ({
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the CalibrationStatus function
jest.mock('../src/components/CalibrationStatus', () => ({
  isCalibrationExpired: jest.fn(),
}));

// Mock dayjs
jest.mock('dayjs', () => {
  const actualDayjs = jest.requireActual('dayjs');
  return actualDayjs;
});

describe('useToolAssignment', () => {
  const mockInventory = {
    getTool: jest.fn(),
    getEmployee: jest.fn(),
    assignTool: jest.fn(),
    reassignTool: jest.fn(),
    unassignTool: jest.fn(),
  } as unknown as InventoryAPI;

  const mockSetEditingState = jest.fn();
  const mockSetEmployeeSearchText = jest.fn();
  const mockFocusInput = jest.fn();
  const mockSetSelectedTool = jest.fn();
  const mockSetUnassignModalVisible = jest.fn();
  const mockResetEditingState = jest.fn();
  const mockResetUnassignState = jest.fn();
  const mockLoadTools = jest.fn();

  const mockTool: Tool = {
    id: 'T1' as `T${number}`,
    type: 'HydraulicWrench',
    model: 'Test Model',
    serialNumber: 'TEST001',
    calibrationDueDate: '2024-12-01',
    assignedTo: null,
    assignedOn: null,
  };

  const mockEmployee: Employee = {
    id: 'E1' as `E${number}`,
    name: 'John Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (isCalibrationExpired as jest.Mock).mockReturnValue(false);
    (mockInventory.getTool as jest.Mock).mockResolvedValue(mockTool);
    (mockInventory.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);
    (mockInventory.assignTool as jest.Mock).mockResolvedValue({ ok: true });
    (mockInventory.reassignTool as jest.Mock).mockResolvedValue({ ok: true });
    (mockInventory.unassignTool as jest.Mock).mockResolvedValue({ ok: true });
    mockLoadTools.mockResolvedValue(undefined);
  });

  describe('handleEdit', () => {
    it('should handle editing an unassigned tool', async () => {
      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleEdit(
          'T1',
          mockInventory,
          mockSetEditingState,
          mockSetEmployeeSearchText,
          mockFocusInput,
        );
      });

      expect(mockInventory.getTool).toHaveBeenCalledWith('T1');
      expect(mockSetEditingState).toHaveBeenCalledWith({
        toolId: 'T1',
        assignedTo: '',
        assignedOn: dayjs().format('YYYY-MM-DD'),
        originalAssignedTo: '',
        originalAssignedOn: '',
      });
      expect(mockSetEmployeeSearchText).toHaveBeenCalledWith('');
      expect(mockFocusInput).toHaveBeenCalled();
    });

    it('should handle editing an assigned tool', async () => {
      const assignedTool = {
        ...mockTool,
        assignedTo: 'E1' as `E${number}`,
        assignedOn: '2023-12-01' as const,
      };
      (mockInventory.getTool as jest.Mock).mockResolvedValue(assignedTool);

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleEdit(
          'T1',
          mockInventory,
          mockSetEditingState,
          mockSetEmployeeSearchText,
          mockFocusInput,
        );
      });

      expect(mockSetEditingState).toHaveBeenCalledWith({
        toolId: 'T1',
        assignedTo: 'E1',
        assignedOn: '2023-12-01',
        originalAssignedTo: 'E1',
        originalAssignedOn: '2023-12-01',
      });
      expect(mockInventory.getEmployee).toHaveBeenCalledWith('E1');
      expect(mockSetEmployeeSearchText).toHaveBeenCalledWith('John Doe');
    });

    it('should not proceed if tool is not found', async () => {
      (mockInventory.getTool as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleEdit(
          'T1',
          mockInventory,
          mockSetEditingState,
          mockSetEmployeeSearchText,
          mockFocusInput,
        );
      });

      expect(mockSetEditingState).not.toHaveBeenCalled();
      expect(mockFocusInput).not.toHaveBeenCalled();
    });

    it('should not proceed if calibration is expired', async () => {
      (isCalibrationExpired as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleEdit(
          'T1',
          mockInventory,
          mockSetEditingState,
          mockSetEmployeeSearchText,
          mockFocusInput,
        );
      });

      expect(mockSetEditingState).not.toHaveBeenCalled();
      expect(mockFocusInput).not.toHaveBeenCalled();
    });

    it('should handle errors silently', async () => {
      (mockInventory.getTool as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleEdit(
          'T1',
          mockInventory,
          mockSetEditingState,
          mockSetEmployeeSearchText,
          mockFocusInput,
        );
      });

      expect(mockSetEditingState).not.toHaveBeenCalled();
    });
  });

  describe('handleUnassign', () => {
    it('should set up unassign modal with tool data', async () => {
      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleUnassign('T1', mockInventory, mockSetSelectedTool, mockSetUnassignModalVisible);
      });

      expect(mockInventory.getTool).toHaveBeenCalledWith('T1');
      expect(mockSetSelectedTool).toHaveBeenCalledWith({
        id: mockTool.id,
        type: mockTool.type,
        model: mockTool.model,
        serialNumber: mockTool.serialNumber,
        calibrationDueDate: mockTool.calibrationDueDate,
        assignedTo: null,
        assignedOn: null,
      });
      expect(mockSetUnassignModalVisible).toHaveBeenCalledWith(true);
    });

    it('should not proceed if tool is not found', async () => {
      (mockInventory.getTool as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleUnassign('T1', mockInventory, mockSetSelectedTool, mockSetUnassignModalVisible);
      });

      expect(mockSetSelectedTool).not.toHaveBeenCalled();
      expect(mockSetUnassignModalVisible).not.toHaveBeenCalled();
    });

    it('should handle errors silently', async () => {
      (mockInventory.getTool as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleUnassign('T1', mockInventory, mockSetSelectedTool, mockSetUnassignModalVisible);
      });

      expect(mockSetSelectedTool).not.toHaveBeenCalled();
      expect(mockSetUnassignModalVisible).not.toHaveBeenCalled();
    });
  });

  describe('handleSave', () => {
    it('should handle new assignment', async () => {
      const editingState: IEditingState = {
        toolId: 'T1',
        assignedTo: 'E1',
        assignedOn: '2023-12-01',
        originalAssignedTo: '',
        originalAssignedOn: '',
      };

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleSave(editingState, mockInventory, mockResetEditingState, mockLoadTools);
      });

      expect(mockInventory.assignTool).toHaveBeenCalledWith({
        toolId: 'T1',
        employeeId: 'E1',
        assignedOn: '2023-12-01',
      });
      expect(message.success).toHaveBeenCalledWith('Tool assigned successfully');
      expect(mockResetEditingState).toHaveBeenCalled();
      expect(mockLoadTools).toHaveBeenCalled();
    });

    it('should handle reassignment', async () => {
      const editingState: IEditingState = {
        toolId: 'T1',
        assignedTo: 'E2',
        assignedOn: '2023-12-01',
        originalAssignedTo: 'E1',
        originalAssignedOn: '2023-11-01',
      };

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleSave(editingState, mockInventory, mockResetEditingState, mockLoadTools);
      });

      expect(mockInventory.reassignTool).toHaveBeenCalledWith({
        toolId: 'T1',
        employeeId: 'E2',
        assignedOn: '2023-12-01',
      });
      expect(message.success).toHaveBeenCalledWith('Tool reassigned successfully');
      expect(mockResetEditingState).toHaveBeenCalled();
      expect(mockLoadTools).toHaveBeenCalled();
    });

    it('should handle unassignment', async () => {
      const editingState: IEditingState = {
        toolId: 'T1',
        assignedTo: '',
        assignedOn: '2023-12-01',
        originalAssignedTo: 'E1',
        originalAssignedOn: '2023-11-01',
      };

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleSave(editingState, mockInventory, mockResetEditingState, mockLoadTools);
      });

      expect(mockInventory.unassignTool).toHaveBeenCalledWith({
        toolId: 'T1',
      });
      expect(message.success).toHaveBeenCalledWith('Tool unassigned successfully');
      expect(mockResetEditingState).toHaveBeenCalled();
      expect(mockLoadTools).toHaveBeenCalled();
    });

    it('should not proceed if editing state is null', async () => {
      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleSave(null, mockInventory, mockResetEditingState, mockLoadTools);
      });

      expect(mockInventory.assignTool).not.toHaveBeenCalled();
      expect(mockInventory.reassignTool).not.toHaveBeenCalled();
      expect(mockInventory.unassignTool).not.toHaveBeenCalled();
      expect(mockResetEditingState).not.toHaveBeenCalled();
    });

    it('should handle assignment failure', async () => {
      const editingState: IEditingState = {
        toolId: 'T1',
        assignedTo: 'E1',
        assignedOn: '2023-12-01',
        originalAssignedTo: '',
        originalAssignedOn: '',
      };

      (mockInventory.assignTool as jest.Mock).mockResolvedValue({
        ok: false,
        error: 'Assignment failed',
      });

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleSave(editingState, mockInventory, mockResetEditingState, mockLoadTools);
      });

      expect(message.error).toHaveBeenCalledWith('Assignment failed: Assignment failed');
      expect(mockResetEditingState).not.toHaveBeenCalled();
      expect(mockLoadTools).not.toHaveBeenCalled();
    });

    it('should handle API errors silently', async () => {
      const editingState: IEditingState = {
        toolId: 'T1',
        assignedTo: 'E1',
        assignedOn: '2023-12-01',
        originalAssignedTo: '',
        originalAssignedOn: '',
      };

      (mockInventory.assignTool as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleSave(editingState, mockInventory, mockResetEditingState, mockLoadTools);
      });

      expect(mockResetEditingState).not.toHaveBeenCalled();
    });
  });

  describe('handleCancel', () => {
    it('should call reset editing state', () => {
      const { result } = renderHook(() => useToolAssignment());

      act(() => {
        result.current.handleCancel(mockResetEditingState);
      });

      expect(mockResetEditingState).toHaveBeenCalled();
    });
  });

  describe('handleUnassignConfirm', () => {
    it('should unassign tool and reset state', async () => {
      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleUnassignConfirm(mockTool, mockInventory, mockResetUnassignState, mockLoadTools);
      });

      expect(mockInventory.unassignTool).toHaveBeenCalledWith({
        toolId: 'T1',
      });
      expect(message.success).toHaveBeenCalledWith('Tool unassigned successfully');
      expect(mockResetUnassignState).toHaveBeenCalled();
      expect(mockLoadTools).toHaveBeenCalled();
    });

    it('should not proceed if selected tool is null', async () => {
      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleUnassignConfirm(null, mockInventory, mockResetUnassignState, mockLoadTools);
      });

      expect(mockInventory.unassignTool).not.toHaveBeenCalled();
      expect(mockResetUnassignState).not.toHaveBeenCalled();
      expect(mockLoadTools).not.toHaveBeenCalled();
    });

    it('should handle API errors silently', async () => {
      (mockInventory.unassignTool as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useToolAssignment());

      await act(async () => {
        await result.current.handleUnassignConfirm(mockTool, mockInventory, mockResetUnassignState, mockLoadTools);
      });

      expect(mockResetUnassignState).not.toHaveBeenCalled();
      expect(mockLoadTools).not.toHaveBeenCalled();
    });
  });

  describe('handleUnassignCancel', () => {
    it('should call reset unassign state', () => {
      const { result } = renderHook(() => useToolAssignment());

      act(() => {
        result.current.handleUnassignCancel(mockResetUnassignState);
      });

      expect(mockResetUnassignState).toHaveBeenCalled();
    });
  });

  it('should provide stable function references', () => {
    const { result, rerender } = renderHook(() => useToolAssignment());

    const firstRender = {
      handleEdit: result.current.handleEdit,
      handleUnassign: result.current.handleUnassign,
      handleSave: result.current.handleSave,
      handleCancel: result.current.handleCancel,
      handleUnassignConfirm: result.current.handleUnassignConfirm,
      handleUnassignCancel: result.current.handleUnassignCancel,
    };

    rerender();

    expect(result.current.handleEdit).toBe(firstRender.handleEdit);
    expect(result.current.handleUnassign).toBe(firstRender.handleUnassign);
    expect(result.current.handleSave).toBe(firstRender.handleSave);
    expect(result.current.handleCancel).toBe(firstRender.handleCancel);
    expect(result.current.handleUnassignConfirm).toBe(firstRender.handleUnassignConfirm);
    expect(result.current.handleUnassignCancel).toBe(firstRender.handleUnassignCancel);
  });
});
