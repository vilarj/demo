import { AutoComplete } from 'antd';
import type { BaseSelectRef } from 'rc-select';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { IEmployeeSelectorProps } from '../interfaces/IEmployeeSelectorProps';
import { Employee } from '../inventory-api';

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
    const [employees, setEmployees] = useState<Employee[]>([]);

    const fetchEmployees = useCallback(
      async (searchValue: string) => {
        try {
          let fetchedEmployees: Employee[];
          if (!searchValue.trim()) {
            fetchedEmployees = await inventorySystem.getEmployees();
          } else {
            fetchedEmployees = await inventorySystem.searchEmployees(searchValue);
          }
          setEmployees(fetchedEmployees);
        } catch (error) {
          console.error('Failed to fetch employees:', error);
          setEmployees([]);
        }
      },
      [inventorySystem],
    );

    useEffect(() => {
      const handler = setTimeout(() => {
        fetchEmployees(value);
      }, debounceMs);
      return () => {
        clearTimeout(handler);
      };
    }, [value, debounceMs, fetchEmployees]);

    const options = useMemo(
      () =>
        employees.map((employee) => ({
          value: employee.id,
          label: (
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0 }}
              aria-label={`${employee.name} (${employee.id})`}
            >
              <span
                style={{
                  flex: 1,
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {employee.name}
              </span>
              <span
                style={{ color: '#666', fontSize: '0.9em', marginLeft: 12, flexShrink: 0, textAlign: 'right' }}
                aria-label={`Employee number: ${employee.id}`}
              >
                #{employee.id}
              </span>
            </div>
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
        {...(onKeyDown ? { onKeyDown } : {})}
        placeholder={placeholder}
        style={style ?? {}}
        options={options}
        filterOption={false}
        showSearch
        styles={{
          popup: {
            root: { maxHeight: 144, overflowY: 'auto' },
          },
        }}
      />
    );
  },
);

EmployeeSelector.displayName = 'EmployeeSelector';
export default EmployeeSelector;
