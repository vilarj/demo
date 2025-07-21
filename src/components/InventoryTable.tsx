import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useCallback } from 'react';
import InventoryHeader from './InventoryHeader';
import InventoryPagination from './InventoryPagination';
import InventoryTableBody from './InventoryTableBody';
import UnassignModal from './UnassignModal';
import { useInventoryTable } from './hooks/useInventoryTable';
import { useInventoryTableColumns } from './useInventoryTableColumns';

const InventoryTable: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setSearchText,
    editingState,
    employeeSearchText,
    unassignModalVisible,
    selectedTool,
    tools,
    employees,
    pagination,
    setPagination,
    loading,
    setSortBy,
    setSortOrder,
    inputRef,
    inventory,
    employeeMap,
    handleEdit,
    handleUnassign,
    handleSave,
    handleCancel,
    handleUnassignConfirm,
    handleUnassignCancel,
    handleEmployeeSelect,
    handleEmployeeSearch,
    handleDateChange,
  } = useInventoryTable();

  const handlePaginationChange = useCallback(
    (page: number, pageSize?: number) => {
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: pageSize || prev.pageSize,
      }));
    },
    [setPagination],
  );

  const handleTableChange = useCallback(
    (
      _tablePagination: TablePaginationConfig,
      _filters: Record<string, FilterValue | null>,
      sorter: SorterResult<any> | SorterResult<any>[],
    ) => {
      const sortObj = Array.isArray(sorter) ? sorter[0] : sorter;
      if (sortObj && sortObj.field && sortObj.order) {
        setSortBy(sortObj.field as any);
        setSortOrder(sortObj.order === 'ascend' ? 'asc' : 'desc');
      }
    },
    [setSortBy, setSortOrder],
  );

  const filteredEmployees = React.useMemo(() => {
    if (!employeeSearchText) return employees;
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(employeeSearchText.toLowerCase()) ||
        employee.id.toLowerCase().includes(employeeSearchText.toLowerCase()),
    );
  }, [employees, employeeSearchText]);

  const columns = useInventoryTableColumns({
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
    inventorySystem: inventory,
  });

  return (
    <div className="inventory-table-container">
      <InventoryHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inventory={inventory}
        setSearchText={setSearchText}
      />

      <InventoryTableBody columns={columns} tools={tools} loading={loading} handleTableChange={handleTableChange} />

      <InventoryPagination pagination={pagination} handlePaginationChange={handlePaginationChange} />

      <UnassignModal
        visible={unassignModalVisible}
        selectedTool={selectedTool}
        employeeMap={employeeMap}
        onConfirm={handleUnassignConfirm}
        onCancel={handleUnassignCancel}
      />
    </div>
  );
};

export default InventoryTable;
