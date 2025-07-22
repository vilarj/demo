import type { BaseSelectRef } from 'rc-select';
import type { RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
import { IEditingState } from '../../interfaces/IEditingState';
import { Tool } from '../../inventory-api';

export interface UseInventoryUIResult {
  editingState: IEditingState | null;
  setEditingState: (
    stateOrUpdater: IEditingState | null | ((prev: IEditingState | null) => IEditingState | null),
  ) => void;
  employeeSearchText: string;
  setEmployeeSearchText: (text: string) => void;
  unassignModalVisible: boolean;
  setUnassignModalVisible: (visible: boolean) => void;
  selectedTool: Tool | null;
  setSelectedTool: (tool: Tool | null) => void;
  inputRef: RefObject<BaseSelectRef | null>;
  focusInput: () => void;
  resetUI: () => void;
}

/**
 * Hook for managing UI state including modals, editing state, and input focus
 * Handles editing forms, unassign modal, and input field management
 */
export function useInventoryUI(): UseInventoryUIResult {
  const [editingState, setEditingStateInternal] = useState<IEditingState | null>(null);
  const [employeeSearchText, setEmployeeSearchText] = useState('');
  const [unassignModalVisible, setUnassignModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const inputRef = useRef<BaseSelectRef | null>(null);

  const setEditingState = useCallback(
    (stateOrUpdater: IEditingState | null | ((prev: IEditingState | null) => IEditingState | null)) => {
      if (typeof stateOrUpdater === 'function') {
        setEditingStateInternal(stateOrUpdater);
      } else {
        setEditingStateInternal(stateOrUpdater);
      }
    },
    [],
  );

  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const resetUI = useCallback(() => {
    setEditingStateInternal(null);
    setEmployeeSearchText('');
    setUnassignModalVisible(false);
    setSelectedTool(null);
  }, []);

  return {
    editingState,
    setEditingState,
    employeeSearchText,
    setEmployeeSearchText,
    unassignModalVisible,
    setUnassignModalVisible,
    selectedTool,
    setSelectedTool,
    inputRef,
    focusInput,
    resetUI,
  };
}
