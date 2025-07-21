import { TablePaginationConfig } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import { Tool } from '../inventory-api';

export interface IInventoryTableBodyProps {
  columns: ColumnsType<Tool>;
  tools: Tool[];
  loading: boolean;
  handleTableChange: (
    tablePagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Tool> | SorterResult<Tool>[],
  ) => void;
}
