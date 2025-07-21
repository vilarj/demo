import { DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { IUseInventoryTableColumnsProps } from '../interfaces/IUseInventoryTableColumnsProps';
import type { Tool } from '../inventory-api';
import { CalibrationStatus, isCalibrationExpired } from './CalibrationStatus';
import EditAction from './EditAction';
import EmployeeSelector from './EmployeeSelector';

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
      {
        title: 'Calibration Status',
        dataIndex: 'calibrationDueDate',
        key: 'calibrationStatus',
        sorter: true,
        width: 160,
        render: (_: string, record: Tool) => {
          const days = dayjs(record.calibrationDueDate).diff(dayjs(), 'day');
          return <CalibrationStatus days={days} toolId={record.id} serialNumber={record.serialNumber} />;
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
      {
        title: 'Assigned To',
        dataIndex: 'assignedTo',
        key: 'assignedTo',
        width: 200,
        render: (assignedTo: string | null, record: Tool) => {
          const isEditing = editingState?.toolId === record.id;
          if (isEditing) {
            return (
              <EmployeeSelector
                ref={inputRef}
                inventorySystem={inventorySystem}
                value={employeeSearchText}
                onChange={handleEmployeeSearch}
                onSelect={handleEmployeeSelect}
                placeholder="Search or select employee..."
                style={{ minWidth: 250, width: 300 }}
              />
            );
          }
          return assignedTo ? (
            <span
              tabIndex={0}
              aria-label={employeeMap[assignedTo]?.name ? `Assigned to ${employeeMap[assignedTo].name}` : 'Assigned'}
              title={employeeMap[assignedTo]?.id ? `Employee #: ${employeeMap[assignedTo].id}` : ''}
              style={{ cursor: 'pointer' }}
            >
              {employeeMap[assignedTo]?.name || assignedTo}
            </span>
          ) : (
            <span style={{ color: '#999', fontStyle: 'italic' }}>-</span>
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
          if (isEditing && editingState.assignedTo) {
            return (
              <DatePicker
                value={editingState.assignedOn ? dayjs(editingState.assignedOn) : null}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                size="small"
                style={{ width: '100%' }}
              />
            );
          }
          return assignedOn ? dayjs(assignedOn).format('MMM DD, YYYY') : '-';
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_, record: Tool) => {
          const days = dayjs(record.calibrationDueDate).diff(dayjs(), 'day');
          const isEditing = editingState?.toolId === record.id;
          const isOtherRowEditing = !!editingState && editingState.toolId !== record.id;
          const isAssigned = !!record.assignedTo;
          const calibrationExpired = isCalibrationExpired(days);
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
