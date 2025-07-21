import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InventoryPagination from '../src/components/InventoryPagination';

describe('InventoryPagination', () => {
  let mockHandlePaginationChange: jest.Mock;

  beforeEach(() => {
    mockHandlePaginationChange = jest.fn();
  });

  it('renders pagination information correctly', () => {
    const pagination = {
      current: 1,
      pageSize: 25,
      total: 100,
    };

    render(<InventoryPagination pagination={pagination} handlePaginationChange={mockHandlePaginationChange} />);

    expect(screen.getByText('Showing 1 to 25 of 100 tools')).toBeInTheDocument();
  });

  it('renders pagination information for middle page correctly', () => {
    const pagination = {
      current: 3,
      pageSize: 25,
      total: 100,
    };

    render(<InventoryPagination pagination={pagination} handlePaginationChange={mockHandlePaginationChange} />);

    expect(screen.getByText('Showing 51 to 75 of 100 tools')).toBeInTheDocument();
  });

  it('renders pagination information for last page correctly', () => {
    const pagination = {
      current: 4,
      pageSize: 25,
      total: 87,
    };

    render(<InventoryPagination pagination={pagination} handlePaginationChange={mockHandlePaginationChange} />);

    expect(screen.getByText('Showing 76 to 87 of 87 tools')).toBeInTheDocument();
  });

  it('handles empty results correctly', () => {
    const pagination = {
      current: 1,
      pageSize: 25,
      total: 0,
    };

    render(<InventoryPagination pagination={pagination} handlePaginationChange={mockHandlePaginationChange} />);

    expect(screen.getByText('Showing 0 to 0 of 0 tools')).toBeInTheDocument();
  });

  it('calls handlePaginationChange when page is changed', async () => {
    const user = userEvent.setup();
    const pagination = {
      current: 1,
      pageSize: 25,
      total: 100,
    };

    render(<InventoryPagination pagination={pagination} handlePaginationChange={mockHandlePaginationChange} />);

    const nextButton = screen.getByTitle('Next Page');
    await user.click(nextButton);

    expect(mockHandlePaginationChange).toHaveBeenCalledWith(2, 25);
  });

  it('displays page size options', () => {
    const pagination = {
      current: 1,
      pageSize: 25,
      total: 100,
    };

    render(<InventoryPagination pagination={pagination} handlePaginationChange={mockHandlePaginationChange} />);

    expect(screen.getByText('25 / page')).toBeInTheDocument();
  });

  it('shows total items correctly in pagination footer', () => {
    const pagination = {
      current: 1,
      pageSize: 25,
      total: 100,
    };

    render(<InventoryPagination pagination={pagination} handlePaginationChange={mockHandlePaginationChange} />);

    expect(screen.getByText('1-25 of 100 items')).toBeInTheDocument();
  });

  it('renders with proper card styling', () => {
    const pagination = {
      current: 1,
      pageSize: 25,
      total: 100,
    };

    const { container } = render(
      <InventoryPagination pagination={pagination} handlePaginationChange={mockHandlePaginationChange} />,
    );

    expect(container.querySelector('.inventory-pagination')).toBeInTheDocument();
    expect(container.querySelector('.mt-8')).toBeInTheDocument();
    expect(container.querySelector('.mb-6')).toBeInTheDocument();
    expect(container.querySelector('.text-center')).toBeInTheDocument();
  });
});
