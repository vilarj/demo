import { Tabs } from 'antd';
import React from 'react';
import { TabType } from '../api/types/TabType';
import { IInventoryTabsProps } from '../interfaces/IInventoryTabsProps';

/**
 * `InventoryTabs` Component
 *
 * A navigation component that provides tab-based filtering for the inventory table.
 * Users can switch between different views to see all tools, only assigned tools,
 * or only available (unassigned) tools. Uses Ant Design's Tabs component with
 * custom styling for a consistent user experience.
 *
 * @component
 *
 * @param props - Component props
 * @param props.activeTab - The currently selected tab that determines which view is active
 * @param props.onTabChange - Callback function invoked when user selects a different tab
 *
 * @returns JSX.Element representing the tab navigation interface
 *
 * @remarks
 * - Uses React.memo for performance optimization to prevent unnecessary re-renders
 * - Tab labels are styled with bold font weight for better visual hierarchy
 * - Uses type assertion to ensure proper TypeScript typing for tab keys
 * - Configured with 'line' type and 'small' size for a compact, clean appearance
 * - All tab keys correspond to the TabType union type for type safety
 *
 * Available Tabs:
 * - 'all': Shows all tools in the inventory regardless of assignment status
 * - 'assigned': Shows only tools that are currently assigned to employees
 * - 'available': Shows only tools that are not assigned to any employee
 */
const InventoryTabs: React.FC<IInventoryTabsProps> = React.memo(({ activeTab, onTabChange }) => {
  /**
   * Tab configuration array defining the available filter options
   * Each tab represents a different view of the inventory data
   */
  const tabs = [
    { key: 'all' as TabType, label: 'All' },
    { key: 'assigned' as TabType, label: 'Assigned' },
    { key: 'available' as TabType, label: 'Available' },
  ];

  /**
   * Transform tab configuration into Ant Design's required format
   * Applies custom styling to tab labels for consistent branding
   */
  const items = tabs.map((tab) => ({
    key: tab.key,
    label: <span className="font-bold">{tab.label}</span>,
  }));

  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => onTabChange(key as TabType)}
      items={items}
      type="line"
      size="small"
    />
  );
});

export default InventoryTabs;
