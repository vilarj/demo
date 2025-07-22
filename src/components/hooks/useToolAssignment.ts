import { message } from 'antd';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { InventoryAPI, Tool } from '../../api';
import { IEditingState } from '../../interfaces/IEditingState';
import { isCalibrationExpired } from '../CalibrationStatus';

export interface UseToolAssignmentResult {
  handleEdit: (
    toolId: string,
    inventory: InventoryAPI,
    setEditingState: (state: IEditingState | null) => void,
    setEmployeeSearchText: (text: string) => void,
    focusInput: () => void,
  ) => Promise<void>;
  handleUnassign: (
    toolId: string,
    inventory: InventoryAPI,
    setSelectedTool: (tool: Tool | null) => void,
    setUnassignModalVisible: (visible: boolean) => void,
  ) => Promise<void>;
  handleSave: (
    editingState: IEditingState | null,
    inventory: InventoryAPI,
    resetEditingState: () => void,
    loadTools: () => Promise<void>,
  ) => Promise<void>;
  handleCancel: (resetEditingState: () => void) => void;
  handleUnassignConfirm: (
    selectedTool: Tool | null,
    inventory: InventoryAPI,
    resetUnassignState: () => void,
    loadTools: () => Promise<void>,
  ) => Promise<void>;
  handleUnassignCancel: (resetUnassignState: () => void) => void;
}

/**
 * Hook for managing tool assignment operations
 * Handles assign, reassign, unassign operations and their UI interactions
 */
export function useToolAssignment(): UseToolAssignmentResult {
  const handleEdit = useCallback(
    async (
      toolId: string,
      inventory: InventoryAPI,
      setEditingState: (state: IEditingState | null) => void,
      setEmployeeSearchText: (text: string) => void,
      focusInput: () => void,
    ) => {
      try {
        const tool = await inventory.getTool(toolId as `T${number}`);
        if (!tool) return;

        const toolWithDays = {
          ...tool,
          calibrationDueIn: dayjs(tool.calibrationDueDate).diff(dayjs(), 'day'),
        };

        if (isCalibrationExpired(toolWithDays.calibrationDueIn)) return;

        setEditingState({
          toolId,
          assignedTo: tool.assignedTo || '',
          assignedOn: tool.assignedOn || dayjs().format('YYYY-MM-DD'),
          originalAssignedTo: tool.assignedTo || '',
          originalAssignedOn: tool.assignedOn || '',
        });

        if (tool.assignedTo) {
          const employee = await inventory.getEmployee(tool.assignedTo);
          if (employee) setEmployeeSearchText(employee.name);
        } else {
          setEmployeeSearchText('');
        }

        focusInput();
      } catch (error) {
        // Handle error silently as in original
      }
    },
    [],
  );

  const handleUnassign = useCallback(
    async (
      toolId: string,
      inventory: InventoryAPI,
      setSelectedTool: (tool: Tool | null) => void,
      setUnassignModalVisible: (visible: boolean) => void,
    ) => {
      try {
        const tool = await inventory.getTool(toolId as `T${number}`);
        if (!tool) return;

        setSelectedTool({
          id: tool.id,
          type: tool.type,
          model: tool.model,
          serialNumber: tool.serialNumber,
          calibrationDueDate: tool.calibrationDueDate,
          assignedTo: tool.assignedTo ?? null,
          assignedOn: tool.assignedOn ?? null,
        });
        setUnassignModalVisible(true);
      } catch (error) {
        // Handle error silently as in original
      }
    },
    [],
  );

  const handleSave = useCallback(
    async (
      editingState: IEditingState | null,
      inventory: InventoryAPI,
      resetEditingState: () => void,
      loadTools: () => Promise<void>,
    ) => {
      if (!editingState) return;

      try {
        const isNewAssignment = !editingState.originalAssignedTo && editingState.assignedTo;
        const isReassignment =
          editingState.originalAssignedTo &&
          editingState.assignedTo &&
          editingState.originalAssignedTo !== editingState.assignedTo;
        const isUnassignment = editingState.originalAssignedTo && !editingState.assignedTo;

        if (isNewAssignment) {
          const result = await inventory.assignTool({
            toolId: editingState.toolId as `T${number}`,
            employeeId: editingState.assignedTo as `E${number}`,
            assignedOn: dayjs(editingState.assignedOn).format('YYYY-MM-DD') as `${number}-${number}-${number}`,
          });
          if (result.ok) {
            message.success('Tool assigned successfully');
          } else {
            message.error(`Assignment failed: ${result.error}`);
            return;
          }
        } else if (isReassignment) {
          const result = await inventory.reassignTool({
            toolId: editingState.toolId as `T${number}`,
            employeeId: editingState.assignedTo as `E${number}`,
            assignedOn: dayjs(editingState.assignedOn).format('YYYY-MM-DD') as `${number}-${number}-${number}`,
          });
          if (result.ok) {
            message.success('Tool reassigned successfully');
          } else {
            message.error(`Reassignment failed: ${result.error}`);
            return;
          }
        } else if (isUnassignment) {
          const result = await inventory.unassignTool({
            toolId: editingState.toolId as `T${number}`,
          });
          if (result.ok) {
            message.success('Tool unassigned successfully');
          } else {
            message.error(`Unassignment failed: ${result.error}`);
            return;
          }
        }

        resetEditingState();
        await loadTools();
      } catch (error) {
        // Handle error silently as in original
      }
    },
    [],
  );

  const handleCancel = useCallback((resetEditingState: () => void): void => {
    resetEditingState();
  }, []);

  const handleUnassignConfirm = useCallback(
    async (
      selectedTool: Tool | null,
      inventory: InventoryAPI,
      resetUnassignState: () => void,
      loadTools: () => Promise<void>,
    ) => {
      if (!selectedTool) return;

      try {
        const result = await inventory.unassignTool({
          toolId: selectedTool.id as `T${number}`,
        });
        if (result.ok) {
          message.success('Tool unassigned successfully');
        }
        resetUnassignState();
        await loadTools();
      } catch (error) {
        // Handle error silently as in original
      }
    },
    [],
  );

  const handleUnassignCancel = useCallback((resetUnassignState: () => void): void => {
    resetUnassignState();
  }, []);

  return {
    handleEdit,
    handleUnassign,
    handleSave,
    handleCancel,
    handleUnassignConfirm,
    handleUnassignCancel,
  };
}
