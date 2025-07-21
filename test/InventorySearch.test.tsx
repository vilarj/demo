import { screen, waitFor } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InventorySearch from '../src/components/InventorySearch';
import { MockInventorySystem, type Tool, type ToolId } from '../src/inventory-api';

describe('InventorySearch', () => {
  const mockTools: Record<ToolId, Tool> = {
    T1: {
      id: 'T1',
      type: 'HydraulicWrench',
      model: 'HW-100',
      serialNumber: 'SN123',
      calibrationDueDate: '2025-12-01',
      assignedTo: null,
      assignedOn: null,
    },
    T2: {
      id: 'T2',
      type: 'PneumaticWrench',
      model: 'PW-200',
      serialNumber: 'SN456',
      calibrationDueDate: '2025-11-01',
      assignedTo: null,
      assignedOn: null,
    },
  };

  let mockInventorySystem: MockInventorySystem;
  let mockOnSearchResults: jest.Mock;
  let mockOnSearchChange: jest.Mock;

  beforeEach(() => {
    mockInventorySystem = new MockInventorySystem(mockTools, {}, 0);
    mockOnSearchResults = jest.fn();
    mockOnSearchChange = jest.fn();
  });

  it('renders with default placeholder', () => {
    render(<InventorySearch inventorySystem={mockInventorySystem} onSearchResults={mockOnSearchResults} />);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <InventorySearch
        inventorySystem={mockInventorySystem}
        onSearchResults={mockOnSearchResults}
        placeholder="Search tools..."
      />,
    );

    expect(screen.getByPlaceholderText('Search tools...')).toBeInTheDocument();
  });

  it('calls onSearchChange when input value changes', async () => {
    const user = userEvent.setup();

    render(
      <InventorySearch
        inventorySystem={mockInventorySystem}
        onSearchResults={mockOnSearchResults}
        onSearchChange={mockOnSearchChange}
      />,
    );

    const input = screen.getByRole('searchbox');
    await user.type(input, 'hydraulic');

    expect(mockOnSearchChange).toHaveBeenCalledWith('hydraulic');
  });

  it('performs search after debounce delay', async () => {
    const user = userEvent.setup();

    render(
      <InventorySearch inventorySystem={mockInventorySystem} onSearchResults={mockOnSearchResults} debounceMs={0} />,
    );

    const input = screen.getByRole('searchbox');
    await user.type(input, 'hydraulic');

    await waitFor(() => {
      expect(mockOnSearchResults).toHaveBeenCalledWith([mockTools.T1]);
    });
  });

  it('does not search for empty input', async () => {
    const user = userEvent.setup();

    render(
      <InventorySearch inventorySystem={mockInventorySystem} onSearchResults={mockOnSearchResults} debounceMs={0} />,
    );

    const input = screen.getByRole('searchbox');
    await user.type(input, '   '); // Just spaces

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockOnSearchResults).not.toHaveBeenCalled();
  });

  it('handles search errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorSystem = {
      search: jest.fn().mockRejectedValue(new Error('Search failed')),
    } as unknown as MockInventorySystem;

    const user = userEvent.setup();

    render(<InventorySearch inventorySystem={errorSystem} onSearchResults={mockOnSearchResults} debounceMs={0} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test');

    await waitFor(() => {
      expect(mockOnSearchResults).toHaveBeenCalledWith([]);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Search failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('applies custom className', () => {
    const { container } = render(
      <InventorySearch
        inventorySystem={mockInventorySystem}
        onSearchResults={mockOnSearchResults}
        className="custom-class"
      />,
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
