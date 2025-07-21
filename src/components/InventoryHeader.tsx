import { Flex } from 'antd';
import React from 'react';
import { IInventoryHeaderProps } from '../interfaces/IInventoryHeaderProps';
import InventorySearch from './InventorySearch';
import InventoryTabs from './InventoryTabs';

/**
 * InventoryHeader renders the top section of the inventory page, including the tab selector and search bar.
 *
 * Props (from IInventoryHeaderProps):
 *   - activeTab: TabType - The currently selected tab
 *   - setActiveTab: (tab: TabType) => void - Handler to change the active tab
 *   - inventory: MockInventorySystem - The inventory system instance
 *   - setSearchText: (text: string) => void - Handler to update the search text
 *
 * Features:
 *   - Displays inventory tabs for filtering tools
 *   - Provides a search bar for filtering tools by text
 */
const InventoryHeader: React.FC<IInventoryHeaderProps> = ({ activeTab, setActiveTab, inventory, setSearchText }) => (
  <Flex className="inventory-header mb-4" justify="space-between" align="center">
    <div className="flex-grow-0 flex-shrink">
      <InventoryTabs activeTab={activeTab} onTabChange={setActiveTab} inventorySystem={inventory} />
    </div>
    <div className="flex-shrink-0 ml-auto w-56 min-w-40">
      <InventorySearch
        inventorySystem={inventory}
        onSearchResults={() => {}}
        onSearchChange={setSearchText}
        placeholder="Search tools..."
      />
    </div>
  </Flex>
);

export default InventoryHeader;
