import { Pagination } from 'antd';
import React from 'react';
import { IInventoryPaginationProps } from '../interfaces/IInventoryPaginationProps';

const InventoryPagination: React.FC<IInventoryPaginationProps> = ({ pagination, handlePaginationChange }) => (
  <div
    className="inventory-pagination"
    style={{
      marginTop: 32,
      marginBottom: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#fafbfc',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      padding: '20px 0',
    }}
  >
    <div className="pagination-info" style={{ marginBottom: 8, fontWeight: 500 }}>
      Showing {Math.min((pagination.current - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
      {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} tools
    </div>
    <Pagination
      current={pagination.current}
      total={pagination.total}
      pageSize={pagination.pageSize}
      showSizeChanger
      showQuickJumper
      pageSizeOptions={['25', '50', '100', '200']}
      onChange={handlePaginationChange}
      onShowSizeChange={handlePaginationChange}
      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
    />
  </div>
);

export default InventoryPagination;
