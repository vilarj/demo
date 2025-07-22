import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryAPI } from '../src/api';
import { TabType } from '../src/api/types/TabType';
import InventoryHeader from '../src/components/InventoryHeader';
interface MockInventoryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}
jest.mock('../src/components/InventoryTabs', () => {
  return function MockInventoryTabs({ activeTab, onTabChange }: MockInventoryTabsProps) {
    return (
      <div data-testid="inventory-tabs">
        <button onClick={() => onTabChange('all')} data-active={activeTab === 'all'}>
          All
        </button>
        <button onClick={() => onTabChange('assigned')} data-active={activeTab === 'assigned'}>
          Assigned
        </button>
        <button onClick={() => onTabChange('available')} data-active={activeTab === 'available'}>
          Available
        </button>
      </div>
    );
  };
});

interface MockInventorySearchProps {
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  filter?: 'all' | 'assigned' | 'available';
}
jest.mock('../src/components/InventorySearch', () => {
  return function MockInventorySearch({ onSearchChange, placeholder }: MockInventorySearchProps) {
    return (
      <input
        data-testid="inventory-search"
        placeholder={placeholder}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
    );
  };
});

describe('InventoryHeader', () => {
  let mockInventory: InventoryAPI;
  let mockSetActiveTab: jest.Mock;
  let mockSetSearchText: jest.Mock;

  beforeEach(() => {
    mockInventory = new InventoryAPI({}, {}, 0);
    mockSetActiveTab = jest.fn();
    mockSetSearchText = jest.fn();
  });

  it('renders inventory tabs component', () => {
    render(
      <InventoryHeader
        activeTab="all"
        setActiveTab={mockSetActiveTab}
        inventory={mockInventory}
        setSearchText={mockSetSearchText}
      />,
    );

    expect(screen.getByTestId('inventory-tabs')).toBeInTheDocument();
  });

  it('renders inventory search component', () => {
    render(
      <InventoryHeader
        activeTab="all"
        setActiveTab={mockSetActiveTab}
        inventory={mockInventory}
        setSearchText={mockSetSearchText}
      />,
    );

    expect(screen.getByTestId('inventory-search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('passes correct props to InventoryTabs', () => {
    render(
      <InventoryHeader
        activeTab="assigned"
        setActiveTab={mockSetActiveTab}
        inventory={mockInventory}
        setSearchText={mockSetSearchText}
      />,
    );

    const allButton = screen.getByText('All');
    const assignedButton = screen.getByText('Assigned');

    expect(allButton).toHaveAttribute('data-active', 'false');
    expect(assignedButton).toHaveAttribute('data-active', 'true');
  });

  it('passes setActiveTab function to InventoryTabs', async () => {
    const user = userEvent.setup();

    render(
      <InventoryHeader
        activeTab="all"
        setActiveTab={mockSetActiveTab}
        inventory={mockInventory}
        setSearchText={mockSetSearchText}
      />,
    );

    const assignedButton = screen.getByText('Assigned');
    await user.click(assignedButton);

    expect(mockSetActiveTab).toHaveBeenCalledWith('assigned');
  });

  it('passes setSearchText function to InventorySearch', async () => {
    const user = userEvent.setup();

    render(
      <InventoryHeader
        activeTab="all"
        setActiveTab={mockSetActiveTab}
        inventory={mockInventory}
        setSearchText={mockSetSearchText}
      />,
    );

    const searchInput = screen.getByTestId('inventory-search');
    await user.type(searchInput, 'test search');

    expect(mockSetSearchText).toHaveBeenCalledWith('test search');
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <InventoryHeader
        activeTab="all"
        setActiveTab={mockSetActiveTab}
        inventory={mockInventory}
        setSearchText={mockSetSearchText}
      />,
    );

    const header = container.querySelector('.inventory-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('mb-4');

    const tabsContainer = container.querySelector('.flex-grow-0');
    expect(tabsContainer).toBeInTheDocument();

    const searchContainer = container.querySelector('.flex-shrink-0');
    expect(searchContainer).toBeInTheDocument();
    expect(searchContainer).toHaveClass('ml-auto');
    expect(searchContainer).toHaveClass('w-56');
    expect(searchContainer).toHaveClass('min-w-40');
  });

  it('renders with different active tabs', () => {
    const tabs: TabType[] = ['all', 'assigned', 'available'];

    tabs.forEach((tab) => {
      const { unmount } = render(
        <InventoryHeader
          activeTab={tab}
          setActiveTab={mockSetActiveTab}
          inventory={mockInventory}
          setSearchText={mockSetSearchText}
        />,
      );

      const activeButton = screen.getByText(tab === 'all' ? 'All' : tab === 'assigned' ? 'Assigned' : 'Available');
      expect(activeButton).toHaveAttribute('data-active', 'true');

      unmount();
    });
  });
});
