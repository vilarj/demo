import { DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { IUseInventoryTableColumnsProps } from '../interfaces/IUseInventoryTableColumnsProps';
import type { Tool } from '../inventory-api';
import { CalibrationStatus, isCalibrationExpired } from './CalibrationStatus';
import EditAction from './EditAction';
import EmployeeSelector from './EmployeeSelector';

/**
 * Custom React Hook: useInventoryTableColumns
 *
 * Creates and manages the column configuration for the inventory management table.
 * This hook encapsulates the complex logic for rendering different column types including
 * inline editing capabilities, employee assignment, calibration status, and actions.
 *
 * @hook
 * @example
 * ```tsx
 * const columns = useInventoryTableColumns({
 *   editingState,
 *   employeeSearchText,
 *   filteredEmployees,
 *   employeeMap,
 *   handleEmployeeSelect,
 *   handleEmployeeSearch,
 *   handleDateChange,
 *   handleEdit,
 *   handleSave,
 *   handleCancel,
 *   handleUnassign,
 *   inputRef,
 *   inventorySystem,
 * });
 *
 * return <Table columns={columns} dataSource={tools} />;
 * ```
 *
 * @param props - Hook configuration object
 * @param props.editingState - Current editing state containing tool ID and form data
 * @param props.employeeSearchText - Current search text for employee selector
 * @param props.filteredEmployees - Array of filtered employees for selection
 * @param props.employeeMap - Map of employee IDs to employee objects for quick lookup
 * @param props.handleEmployeeSelect - Callback for when an employee is selected
 * @param props.handleEmployeeSearch - Callback for employee search input changes
 * @param props.handleDateChange - Callback for assignment date changes
 * @param props.handleEdit - Callback to initiate editing for a specific tool
 * @param props.handleSave - Callback to save changes for the currently edited tool
 * @param props.handleCancel - Callback to cancel editing and revert changes
 * @param props.handleUnassign - Callback to unassign a tool from an employee
 * @param props.inputRef - React ref for the employee selector input element
 * @param props.inventorySystem - Inventory system instance for data operations
 *
 * @returns ColumnsType<Tool> - Ant Design table column configuration array
 *
 * @remarks
 * - Uses useMemo for performance optimization to prevent unnecessary re-renders
 * - Supports inline editing for employee assignment and assignment dates
 * - Includes accessibility features with proper ARIA labels and keyboard navigation
 * - Handles calibration status with color-coded indicators and expiration warnings
 * - Implements conditional rendering based on editing state and tool assignment status
 * - All columns include sorting capabilities where appropriate
 * - Fixed action column for consistent user experience during horizontal scrolling
 *
 * Column Descriptions:
 * - Type: Tool type with sorting capability
 * - Model: Tool model with sorting capability
 * - Serial Number: Unique identifier with sorting capability
 * - Calibration Status: Visual status indicator based on due date proximity
 * - Calibration Due Date: Formatted due date with sorting capability
 * - Assigned To: Employee assignment with inline editing and search functionality
 * - Assigned On: Assignment date with inline date picker editing
 * - Actions: Edit, save, cancel, and unassign operations with contextual availability
 */
export function useInventoryTableColumns({
  editingState,
  employeeSearchText,
  filteredEmployees,
  employeeMap,
  handleEmployeeSelect,
  handleEmployeeSearch,
  handleDateChange,
  handleEdit,
  handleSave,
  handleCancel,
  handleUnassign,
  inputRef,
  inventorySystem,
}: IUseInventoryTableColumnsProps) {
  return useMemo<ColumnsType<Tool>>(
    () => [
      // Basic Tool Information Columns
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        sorter: true,
        width: 120,
      },
      {
        title: 'Model',
        dataIndex: 'model',
        key: 'model',
        sorter: true,
        width: 150,
      },
      {
        title: 'Serial Number',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        sorter: true,
        width: 140,
      },

      // Calibration Information Columns
      {
        title: 'Calibration Status',
        dataIndex: 'calibrationDueDate',
        key: 'calibrationStatus',
        sorter: true,
        width: 160,
        render: (_: string, record: Tool) => {
          // Calculate days until calibration due date
          const days = dayjs(record.calibrationDueDate).diff(dayjs(), 'day');
          return (
            <CalibrationStatus
              days={days}
              toolId={record.id}
              serialNumber={record.serialNumber}
              inventorySystem={inventorySystem}
            />
          );
        },
      },
      {
        title: 'Calibration Due Date',
        dataIndex: 'calibrationDueDate',
        key: 'calibrationDueDate',
        sorter: true,
        width: 140,
        render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      },

      // Assignment Information Columns
      {
        title: 'Assigned To',
        dataIndex: 'assignedTo',
        key: 'assignedTo',
        width: 200,
        render: (assignedTo: string | null, record: Tool) => {
          const isEditing = editingState?.toolId === record.id;

          // Render employee selector when in editing mode
          if (isEditing) {
            return (
              <EmployeeSelector
                ref={inputRef}
                inventorySystem={inventorySystem}
                value={employeeSearchText}
                onChange={handleEmployeeSearch}
                onSelect={handleEmployeeSelect}
                placeholder="Search or select employee..."
                style={{ width: '100%', maxWidth: 300, minWidth: 180 }}
              />
            );
          }

          // Render assigned employee name or placeholder when not editing
          return assignedTo ? (
            <span
              tabIndex={0}
              aria-label={employeeMap[assignedTo]?.name ? `Assigned to ${employeeMap[assignedTo].name}` : 'Assigned'}
              title={employeeMap[assignedTo]?.id ? `Employee #: ${employeeMap[assignedTo].id}` : ''}
              className="cursor-pointer"
            >
              {employeeMap[assignedTo]?.name || assignedTo}
            </span>
          ) : (
            <span></span>
          );
        },
      },
      {
        title: 'Assigned On',
        dataIndex: 'assignedOn',
        key: 'assignedOn',
        sorter: true,
        width: 140,
        render: (assignedOn: string | null, record: Tool) => {
          const isEditing = editingState?.toolId === record.id;

          // Render date picker when editing (regardless of assignment status)
          if (isEditing) {
            return (
              <DatePicker
                value={editingState.assignedOn ? dayjs(editingState.assignedOn) : null}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                size="small"
                className="w-full"
              />
            );
          }

          // Render formatted date or placeholder when not editing
          return assignedOn ? dayjs(assignedOn).format('MMM DD, YYYY') : '';
        },
      },

      // Actions Column
      {
        title: 'Actions',
        key: 'actions',
        width: 160,
        fixed: 'right',
        align: 'center',
        onCell: () => ({
          style: {
            borderRight: '1px solid #e5e7eb',
          },
        }),
        render: (_, record: Tool) => {
          // Calculate calibration and editing state
          const days = dayjs(record.calibrationDueDate).diff(dayjs(), 'day');
          const isEditing = editingState?.toolId === record.id;
          const isOtherRowEditing = !!editingState && editingState.toolId !== record.id;
          const isAssigned = !!record.assignedTo;
          const calibrationExpired = isCalibrationExpired(days);

          // Check if there are unsaved changes
          const hasChanges =
            editingState &&
            (editingState.assignedTo !== editingState.originalAssignedTo ||
              editingState.assignedOn !== editingState.originalAssignedOn);

          return (
            <EditAction
              isEditing={isEditing}
              isAssigned={isAssigned}
              calibrationExpired={calibrationExpired}
              isOtherRowEditing={isOtherRowEditing}
              hasChanges={!!hasChanges}
              onEdit={() => handleEdit(record.id)}
              onSave={handleSave}
              onCancel={handleCancel}
              onUnassign={() => handleUnassign(record.id)}
            />
          );
        },
      },
    ],
    [
      // Dependency array for useMemo optimization
      editingState,
      employeeSearchText,
      filteredEmployees,
      employeeMap,
      handleEmployeeSelect,
      handleEmployeeSearch,
      handleDateChange,
      handleEdit,
      handleSave,
      handleCancel,
      handleUnassign,
      inputRef,
    ],
  );
}
