export interface IInventoryPaginationProps {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  handlePaginationChange: (page: number, pageSize?: number) => void;
}
