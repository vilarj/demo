import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryAPI } from '../src/api';
import { TabType } from '../src/api/types/TabType';
import InventoryTabs from '../src/components/InventoryTabs';

describe('InventoryTabs', () => {
  let mockOnTabChange: jest.Mock;
  let api: InventoryAPI;

  beforeEach(() => {
    mockOnTabChange = jest.fn();
    api = new InventoryAPI({}, {}, 0);
  });

  it('renders all tab options', () => {
    render(<InventoryTabs activeTab="all" onTabChange={mockOnTabChange} inventorySystem={api} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    render(<InventoryTabs activeTab="assigned" onTabChange={mockOnTabChange} inventorySystem={api} />);

    const assignedTab = screen.getByRole('tab', { name: /assigned/i });
    expect(assignedTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onTabChange when a tab is clicked', async () => {
    const user = userEvent.setup();

    render(<InventoryTabs activeTab="all" onTabChange={mockOnTabChange} inventorySystem={api} />);

    const availableTab = screen.getByRole('tab', { name: /available/i });
    await user.click(availableTab);

    expect(mockOnTabChange).toHaveBeenCalledWith('available');
  });

  it('renders tab labels with bold font', () => {
    render(<InventoryTabs activeTab="all" onTabChange={mockOnTabChange} inventorySystem={api} />);

    const allTabLabel = screen.getByText('All');
    expect(allTabLabel).toHaveClass('font-bold');
  });

  it('renders each tab type correctly', () => {
    const tabs: TabType[] = ['all', 'assigned', 'available'];

    tabs.forEach((tab) => {
      const { unmount } = render(<InventoryTabs activeTab={tab} onTabChange={mockOnTabChange} inventorySystem={api} />);

      const activeTab = screen.getByRole('tab', { selected: true });
      expect(activeTab).toBeInTheDocument();

      unmount();
    });
  });
});
