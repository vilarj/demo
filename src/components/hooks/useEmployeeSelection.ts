import dayjs from 'dayjs';
import { useCallback } from 'react';
import { IEditingState } from '../../interfaces/IEditingState';
import { Employee } from '../../inventory-api';

export interface UseEmployeeSelectionResult {
  handleEmployeeSelect: (
    value: string,
    employees: Employee[],
    setEditingState: (updater: (prev: IEditingState | null) => IEditingState | null) => void,
    setEmployeeSearchText: (text: string) => void,
  ) => void;
  handleEmployeeSearch: (
    searchText: string,
    employees: Employee[],
    setEditingState: (updater: (prev: IEditingState | null) => IEditingState | null) => void,
    setEmployeeSearchText: (text: string) => void,
  ) => void;
  handleDateChange: (
    date: dayjs.Dayjs | null,
    setEditingState: (updater: (prev: IEditingState | null) => IEditingState | null) => void,
  ) => void;
}

/**
 * Hook for managing employee selection and search functionality
 * Handles employee dropdown selection, search, and date assignment
 */
export function useEmployeeSelection(): UseEmployeeSelectionResult {
  const handleEmployeeSelect = useCallback(
    (
      value: string,
      employees: Employee[],
      setEditingState: (updater: (prev: IEditingState | null) => IEditingState | null) => void,
      setEmployeeSearchText: (text: string) => void,
    ) => {
      const selectedEmployee = employees.find((emp) => emp.id === value || emp.name === value);
      if (selectedEmployee) {
        setEmployeeSearchText(selectedEmployee.name);
        setEditingState((prevEditingState) => {
          if (!prevEditingState) return null;
          return {
            ...prevEditingState,
            assignedTo: selectedEmployee.id,
            assignedOn: prevEditingState.assignedOn || dayjs().format('YYYY-MM-DD'),
          };
        });
      }
    },
    [],
  );

  const handleEmployeeSearch = useCallback(
    (
      searchText: string,
      employees: Employee[],
      setEditingState: (updater: (prev: IEditingState | null) => IEditingState | null) => void,
      setEmployeeSearchText: (text: string) => void,
    ) => {
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
    [],
  );

  const handleDateChange = useCallback(
    (
      date: dayjs.Dayjs | null,
      setEditingState: (updater: (prev: IEditingState | null) => IEditingState | null) => void,
    ) => {
      if (!date) return;
      setEditingState((prevEditingState) => {
        if (!prevEditingState) return null;
        return {
          ...prevEditingState,
          assignedOn: date.format('YYYY-MM-DD'),
        };
      });
    },
    [],
  );

  return {
    handleEmployeeSelect,
    handleEmployeeSearch,
    handleDateChange,
  };
}
