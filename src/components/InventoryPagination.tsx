import { Card, Pagination, Space, Typography } from 'antd';
import React from 'react';
import { IInventoryPaginationProps } from '../interfaces/IInventoryPaginationProps';

const { Text } = Typography;

/**
 * `InventoryPagination` - A pagination component with summary display for inventory tables
 *
 * This component provides pagination controls and displays a summary of the current
 * data range being viewed. It's designed specifically for inventory management interfaces
 * and integrates seamlessly with Ant Design's Pagination component.
 *
 * @component
 *
 * @param props - The component props
 * @param props.pagination - Current pagination state containing page info and totals
 * @param props.pagination.current - Current active page number (1-indexed)
 * @param props.pagination.pageSize - Number of items displayed per page
 * @param props.pagination.total - Total number of items across all pages
 * @param props.handlePaginationChange - Callback function for pagination state changes
 *
 * @returns A React functional component rendering pagination controls with summary
 */
const InventoryPagination: React.FC<IInventoryPaginationProps> = ({ pagination, handlePaginationChange }) => {
  /**
   * Calculates the starting index of items on the current page
   * @returns The 1-indexed position of the first item on current page
   */
  const getStartIndex = (): number => Math.min((pagination.current - 1) * pagination.pageSize + 1, pagination.total);

  /**
   * Calculates the ending index of items on the current page
   * @returns The 1-indexed position of the last item on current page
   */
  const getEndIndex = (): number => Math.min(pagination.current * pagination.pageSize, pagination.total);

  return (
    <Card className="inventory-pagination mt-8 mb-6 text-center">
      <Space direction="vertical" size="middle">
        {/* Summary text showing current range and total */}
        <Text className="font-medium" role="status" aria-live="polite">
          Showing {getStartIndex()} to {getEndIndex()} of {pagination.total} tools
        </Text>

        {/* Pagination controls */}
        <Pagination
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={['25', '50', '100', '200']}
          onChange={handlePaginationChange}
          onShowSizeChange={handlePaginationChange}
          showTotal={(total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} items`}
          aria-label="Pagination navigation for inventory tools"
        />
      </Space>
    </Card>
  );
};

export default InventoryPagination;
