import { act, renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
import { Employee } from '../src/api';
import { useEmployeeSelection } from '../src/components/hooks/useEmployeeSelection';
import { IEditingState } from '../src/interfaces/IEditingState';

describe('useEmployeeSelection', () => {
  const mockEmployees: Employee[] = [
    { id: 'E1' as `E${number}`, name: 'John Doe' },
    { id: 'E2' as `E${number}`, name: 'Jane Smith' },
    { id: 'E3' as `E${number}`, name: 'Bob Johnson' },
  ];

  const mockSetEditingState = jest.fn();
  const mockSetEmployeeSearchText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleEmployeeSelect', () => {
    it('should select employee by ID and update state', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleEmployeeSelect('E1', mockEmployees, mockSetEditingState, mockSetEmployeeSearchText);
      });

      expect(mockSetEmployeeSearchText).toHaveBeenCalledWith('John Doe');
      expect(mockSetEditingState).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should select employee by name and update state', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleEmployeeSelect(
          'Jane Smith',
          mockEmployees,
          mockSetEditingState,
          mockSetEmployeeSearchText,
        );
      });

      expect(mockSetEmployeeSearchText).toHaveBeenCalledWith('Jane Smith');
      expect(mockSetEditingState).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle non-existent employee gracefully', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleEmployeeSelect(
          'NonExistent',
          mockEmployees,
          mockSetEditingState,
          mockSetEmployeeSearchText,
        );
      });

      expect(mockSetEmployeeSearchText).not.toHaveBeenCalled();
      expect(mockSetEditingState).not.toHaveBeenCalled();
    });

    it('should update editing state with correct values when employee exists', () => {
      const { result } = renderHook(() => useEmployeeSelection());
      const mockPrevState: IEditingState = {
        toolId: 'T1',
        assignedTo: '',
        assignedOn: '',
        originalAssignedTo: '',
        originalAssignedOn: '',
      };

      act(() => {
        result.current.handleEmployeeSelect('E2', mockEmployees, mockSetEditingState, mockSetEmployeeSearchText);
      });

      const updateFunction = mockSetEditingState.mock.calls[0][0];
      const updatedState = updateFunction(mockPrevState);

      expect(updatedState).toEqual({
        ...mockPrevState,
        assignedTo: 'E2',
        assignedOn: dayjs().format('YYYY-MM-DD'),
      });
    });

    it('should preserve existing assignedOn date when present', () => {
      const { result } = renderHook(() => useEmployeeSelection());
      const existingDate = '2023-12-01';
      const mockPrevState: IEditingState = {
        toolId: 'T1',
        assignedTo: '',
        assignedOn: existingDate,
        originalAssignedTo: '',
        originalAssignedOn: '',
      };

      act(() => {
        result.current.handleEmployeeSelect('E1', mockEmployees, mockSetEditingState, mockSetEmployeeSearchText);
      });

      const updateFunction = mockSetEditingState.mock.calls[0][0];
      const updatedState = updateFunction(mockPrevState);

      expect(updatedState.assignedOn).toBe(existingDate);
    });

    it('should return null when prevEditingState is null', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleEmployeeSelect('E1', mockEmployees, mockSetEditingState, mockSetEmployeeSearchText);
      });

      const updateFunction = mockSetEditingState.mock.calls[0][0];
      const updatedState = updateFunction(null);

      expect(updatedState).toBeNull();
    });
  });

  describe('handleEmployeeSearch', () => {
    it('should search by employee ID and update state', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleEmployeeSearch('E1', mockEmployees, mockSetEditingState, mockSetEmployeeSearchText);
      });

      expect(mockSetEmployeeSearchText).toHaveBeenCalledWith('E1');
      expect(mockSetEditingState).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should search by employee name (case insensitive) and update state', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleEmployeeSearch(
          'jane smith',
          mockEmployees,
          mockSetEditingState,
          mockSetEmployeeSearchText,
        );
      });

      expect(mockSetEmployeeSearchText).toHaveBeenCalledWith('jane smith');

      const updateFunction = mockSetEditingState.mock.calls[0][0];
      const mockPrevState: IEditingState = {
        toolId: 'T1',
        assignedTo: '',
        assignedOn: '',
        originalAssignedTo: '',
        originalAssignedOn: '',
      };
      const updatedState = updateFunction(mockPrevState);

      expect(updatedState.assignedTo).toBe('E2');
    });

    it('should clear assignedTo when search text is empty', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleEmployeeSearch('', mockEmployees, mockSetEditingState, mockSetEmployeeSearchText);
      });

      expect(mockSetEmployeeSearchText).toHaveBeenCalledWith('');

      const updateFunction = mockSetEditingState.mock.calls[0][0];
      const mockPrevState: IEditingState = {
        toolId: 'T1',
        assignedTo: 'E1',
        assignedOn: '',
        originalAssignedTo: '',
        originalAssignedOn: '',
      };
      const updatedState = updateFunction(mockPrevState);

      expect(updatedState.assignedTo).toBe('');
    });

    it('should return unchanged state when no employee matches', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleEmployeeSearch(
          'Unknown Employee',
          mockEmployees,
          mockSetEditingState,
          mockSetEmployeeSearchText,
        );
      });

      const updateFunction = mockSetEditingState.mock.calls[0][0];
      const mockPrevState: IEditingState = {
        toolId: 'T1',
        assignedTo: 'E1',
        assignedOn: '2023-12-01',
        originalAssignedTo: '',
        originalAssignedOn: '',
      };
      const updatedState = updateFunction(mockPrevState);

      expect(updatedState).toBe(mockPrevState);
    });

    it('should return null when prevEditingState is null', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleEmployeeSearch('E1', mockEmployees, mockSetEditingState, mockSetEmployeeSearchText);
      });

      const updateFunction = mockSetEditingState.mock.calls[0][0];
      const updatedState = updateFunction(null);

      expect(updatedState).toBeNull();
    });
  });

  describe('handleDateChange', () => {
    it('should update assignedOn date in editing state', () => {
      const { result } = renderHook(() => useEmployeeSelection());
      const testDate = dayjs('2023-12-01');

      act(() => {
        result.current.handleDateChange(testDate, mockSetEditingState);
      });

      expect(mockSetEditingState).toHaveBeenCalledWith(expect.any(Function));

      const updateFunction = mockSetEditingState.mock.calls[0][0];
      const mockPrevState: IEditingState = {
        toolId: 'T1',
        assignedTo: 'E1',
        assignedOn: '',
        originalAssignedTo: '',
        originalAssignedOn: '',
      };
      const updatedState = updateFunction(mockPrevState);

      expect(updatedState.assignedOn).toBe('2023-12-01');
    });

    it('should not update state when date is null', () => {
      const { result } = renderHook(() => useEmployeeSelection());

      act(() => {
        result.current.handleDateChange(null, mockSetEditingState);
      });

      expect(mockSetEditingState).not.toHaveBeenCalled();
    });

    it('should return null when prevEditingState is null', () => {
      const { result } = renderHook(() => useEmployeeSelection());
      const testDate = dayjs('2023-12-01');

      act(() => {
        result.current.handleDateChange(testDate, mockSetEditingState);
      });

      const updateFunction = mockSetEditingState.mock.calls[0][0];
      const updatedState = updateFunction(null);

      expect(updatedState).toBeNull();
    });
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => useEmployeeSelection());

    const firstRender = {
      handleEmployeeSelect: result.current.handleEmployeeSelect,
      handleEmployeeSearch: result.current.handleEmployeeSearch,
      handleDateChange: result.current.handleDateChange,
    };

    rerender();

    expect(result.current.handleEmployeeSelect).toBe(firstRender.handleEmployeeSelect);
    expect(result.current.handleEmployeeSearch).toBe(firstRender.handleEmployeeSearch);
    expect(result.current.handleDateChange).toBe(firstRender.handleDateChange);
  });
});
