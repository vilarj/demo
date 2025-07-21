import { Table } from 'antd';
import React from 'react';
import { IInventoryTableBodyProps } from '../interfaces/InventoryTableBodyProps';

const InventoryTableBody: React.FC<IInventoryTableBodyProps> = ({ columns, tools, loading, handleTableChange }) => (
  <Table
    columns={columns}
    dataSource={tools}
    rowKey="id"
    loading={loading}
    pagination={false}
    onChange={handleTableChange}
    scroll={{ x: 1200 }}
    size="small"
    className="inventory-table"
  />
);

export default InventoryTableBody;
