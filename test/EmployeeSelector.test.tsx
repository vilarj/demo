import { screen, waitFor } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeSelector from '../src/components/EmployeeSelector';
import { MockInventorySystem, type Employee, type EmployeeId } from '../src/inventory-api';

describe('EmployeeSelector', () => {
  const mockEmployees: Record<EmployeeId, Employee> = {
    E1: { id: 'E1', name: 'John Doe' },
    E2: { id: 'E2', name: 'Jane Smith' },
    E3: { id: 'E3', name: 'Bob Johnson' },
  };

  let mockInventorySystem: MockInventorySystem;
  let mockOnChange: jest.Mock;
  let mockOnSelect: jest.Mock;

  beforeEach(() => {
    mockInventorySystem = new MockInventorySystem({}, mockEmployees, 0);
    mockOnChange = jest.fn();
    mockOnSelect = jest.fn();
  });

  it('renders with placeholder text', () => {
    render(
      <EmployeeSelector
        inventorySystem={mockInventorySystem}
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText('Search employee by name or ID')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <EmployeeSelector
        inventorySystem={mockInventorySystem}
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
        placeholder="Custom placeholder"
      />,
    );

    expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
  });

  it('fetches and displays employees on focus', async () => {
    const user = userEvent.setup();

    render(
      <EmployeeSelector
        inventorySystem={mockInventorySystem}
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
        debounceMs={0}
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('filters employees when typing', async () => {
    const user = userEvent.setup();

    render(
      <EmployeeSelector
        inventorySystem={mockInventorySystem}
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
        debounceMs={0}
      />,
    );

    const input = screen.getByRole('combobox');

    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.clear(input);
    await user.type(input, 'John');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', async () => {
    const user = userEvent.setup();

    render(
      <EmployeeSelector
        inventorySystem={mockInventorySystem}
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'test');

    expect(mockOnChange).toHaveBeenCalledTimes(4);
    expect(mockOnChange).toHaveBeenLastCalledWith('t', expect.any(Object));
  });

  it('calls onSelect when an employee is selected', async () => {
    const user = userEvent.setup();

    render(
      <EmployeeSelector
        inventorySystem={mockInventorySystem}
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
        debounceMs={0}
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByText('John Doe'));

    expect(mockOnSelect).toHaveBeenCalledWith('E1', expect.any(Object));
  });

  it('handles errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorSystem = {
      getEmployees: jest.fn().mockRejectedValue(new Error('Network error')),
      searchEmployees: jest.fn().mockRejectedValue(new Error('Search error')),
    } as any;

    render(
      <EmployeeSelector
        inventorySystem={errorSystem}
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
        debounceMs={0}
      />,
    );

    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch employees:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
