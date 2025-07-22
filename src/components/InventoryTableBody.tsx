import { Table } from 'antd';
import React from 'react';
import { IInventoryTableBodyProps } from '../interfaces/InventoryTableBodyProps';

/**
 * `InventoryTableBody Component
 *
 * A specialized table component that renders the main inventory data display.
 * This component wraps Ant Design's Table with custom styling and configuration
 * optimized for inventory management workflows. It provides a responsive,
 * sortable table with hover effects and professional dark header styling.
 *
 * @component
 *
 * @param props - Component props
 * @param props.columns - Column configuration array defining table structure and behavior
 * @param props.tools - Array of tool objects to be displayed in the table
 * @param props.loading - Boolean flag indicating whether data is being fetched/processed
 * @param props.handleTableChange - Callback function for handling table events (sorting, filtering)
 *
 * @returns JSX.Element representing the inventory data table
 *
 * @remarks
 * - Implements a functional component pattern for optimal performance
 * - Uses 'id' field as the unique row key for React reconciliation
 * - Pagination is disabled as it's handled externally by parent components
 * - Horizontal scrolling is enabled with 1200px minimum width for responsiveness
 * - Custom CSS classes provide professional dark header theme with light hover effects
 * - Bordered layout enhances data readability and visual separation
 * - Small size variant optimizes space usage for dense data display
 *
 * Styling Features:
 * - Dark slate header (slate-800) with white text for professional appearance
 * - Bold header text for improved readability and visual hierarchy
 * - Darker border colors (slate-600) for headers to complement dark theme
 * - Light gray borders (gray-300) for table body cells
 * - Subtle blue hover effect (blue-50) for better user interaction feedback
 *
 * Performance Considerations:
 * - Uses React functional component for faster rendering
 * - Leverages Ant Design's built-in virtualization for large datasets
 * - Optimized CSS selectors using Tailwind's arbitrary value syntax
 */
const InventoryTableBody: React.FC<IInventoryTableBodyProps> = ({ columns, tools, loading, handleTableChange }) => (
  <Table
    columns={columns}
    dataSource={tools}
    rowKey="id"
    loading={loading}
    pagination={false}
    onChange={handleTableChange}
    scroll={{ x: 1200, y: 'max-content' }}
    size="small"
    bordered
    className={[
      'inventory-table',
      '[&_.ant-table-thead>tr>th]:bg-slate-800',
      '[&_.ant-table-thead>tr>th]:text-white',
      '[&_.ant-table-thead>tr>th]:font-bold',
      '[&_.ant-table-thead>tr>th]:border-slate-600',
      '[&_.ant-table-tbody>tr>td]:border-gray-300',
      '[&_.ant-table-tbody>tr:hover>td]:bg-blue-50',
      // Ensure actions column content doesn't overflow
      '[&_.ant-table-tbody>tr>td:last-child]:overflow-visible',
      '[&_.ant-table-tbody>tr>td:last-child]:white-space-nowrap',
    ].join(' ')}
  />
);

export default InventoryTableBody;
