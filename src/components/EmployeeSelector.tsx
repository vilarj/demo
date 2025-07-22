import { AutoComplete, Flex, Typography } from 'antd';
import type { BaseSelectRef } from 'rc-select';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Employee } from '../api';
import { IEmployeeSelectorProps } from '../interfaces/IEmployeeSelectorProps';

const { Text } = Typography;

/**
 * `EmployeeSelector` - An autocomplete input component for searching and selecting employees
 *
 * This component provides a debounced search interface for finding employees by name or ID.
 * It displays employees in a dropdown with both name and ID visible, and supports keyboard
 * navigation. The component fetches all employees when empty and searches when text is entered.
 *
 * @component
 *
 * @param props - The component props
 * @param props.inventorySystem - The inventory system instance for fetching/searching employees
 * @param props.value - The current input value (controlled component)
 * @param props.onChange - Callback function triggered when input value changes
 * @param props.onSelect - Callback function triggered when an employee is selected from dropdown
 * @param props.onKeyDown - Optional callback for handling keyboard events
 * @param props.placeholder - Placeholder text displayed when input is empty (default: 'Search employee by name or ID')
 * @param props.style - Optional CSS styles to apply to the AutoComplete component
 * @param props.debounceMs - Debounce delay in milliseconds for search requests (default: 300)
 * @param ref - Forwarded ref to the underlying AutoComplete component
 *
 * @returns A forwardRef React component that renders an employee search autocomplete
 *
 * @throws Will log errors to console if employee fetching/searching fails
 */
const EmployeeSelector = forwardRef<BaseSelectRef, IEmployeeSelectorProps>(
  (
    {
      inventorySystem,
      value,
      onChange,
      onSelect,
      onKeyDown,
      placeholder = 'Search employee by name or ID',
      style,
      debounceMs = 300,
    },
    ref,
  ) => {
    // State to store the list of employees for the dropdown
    const [employees, setEmployees] = useState<Employee[]>([]);

    /**
     * Fetches employees from the inventory system based on search criteria
     *
     * @param searchValue - The search term to filter employees by
     * @returns Promise that resolves when employees are fetched and state is updated
     *
     * @internal
     */
    const fetchEmployees = useCallback(
      async (searchValue: string): Promise<void> => {
        try {
          let fetchedEmployees: Employee[];

          // If no search value, fetch all employees; otherwise search by the value
          if (!searchValue.trim()) {
            fetchedEmployees = await inventorySystem.getEmployees();
          } else {
            fetchedEmployees = await inventorySystem.searchEmployees(searchValue);
          }

          setEmployees(fetchedEmployees);
        } catch (error) {
          console.error('Failed to fetch employees:', error);
          // Set empty array on error to maintain consistent UI state
          setEmployees([]);
        }
      },
      [inventorySystem],
    );

    /**
     * Effect hook that implements debounced employee fetching
     * Delays API calls until user stops typing for the specified debounce period
     */
    useEffect(() => {
      const handler = setTimeout(() => {
        fetchEmployees(value);
      }, debounceMs);

      // Cleanup function to cancel pending fetch if input changes
      return () => {
        clearTimeout(handler);
      };
    }, [value, debounceMs, fetchEmployees]);

    /**
     * Memoized options array for the AutoComplete dropdown
     * Transforms employee data into the format expected by Ant Design's AutoComplete
     *
     * @returns Array of option objects with value and label properties
     */
    const options = useMemo(
      () =>
        employees.map((employee) => ({
          value: employee.id,
          label: (
            <Flex
              justify="space-between"
              align="center"
              className="min-w-0"
              aria-label={`${employee.name} (ID: ${employee.id})`}
              role="option"
            >
              <Text
                className="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap"
                title={employee.name} // Tooltip for truncated names
              >
                {employee.name}
              </Text>
              <Text
                className="text-gray-500 text-sm ml-3 flex-shrink-0 text-right"
                aria-label={`Employee ID: ${employee.id}`}
                title={`Employee ID: ${employee.id}`}
              >
                #{employee.id}
              </Text>
            </Flex>
          ),
        })),
      [employees],
    );

    return (
      <AutoComplete
        ref={ref}
        value={value}
        onChange={onChange}
        onSelect={onSelect}
        {...(onKeyDown && { onKeyDown })}
        placeholder={placeholder}
        style={style ?? {}}
        options={options}
        filterOption={false} // Disable client-side filtering since we handle server-side search
        showSearch
        notFoundContent="No employees found"
        aria-label="Employee search and selection"
        styles={{
          popup: {
            root: {
              maxHeight: 144,
              overflowY: 'auto' as const,
            },
          },
        }}
      />
    );
  },
);

export default EmployeeSelector;
