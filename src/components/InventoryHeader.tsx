import React from 'react';
import { IInventoryHeaderProps } from '../interfaces/IInventoryHeaderProps';
import InventorySearch from './InventorySearch';
import InventoryTabs from './InventoryTabs';

const InventoryHeader: React.FC<IInventoryHeaderProps> = ({ activeTab, setActiveTab, inventory, setSearchText }) => (
  <div
    className="inventory-header"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
  >
    <div style={{ flex: '0 1 auto' }}>
      <InventoryTabs activeTab={activeTab} onTabChange={setActiveTab} inventorySystem={inventory} />
    </div>
    <div style={{ flex: '0 0 auto', marginLeft: 'auto', width: 220, minWidth: 160 }}>
      <InventorySearch
        inventorySystem={inventory}
        onSearchResults={() => {}}
        onSearchChange={setSearchText}
        placeholder="Search tools..."
      />
    </div>
  </div>
);

export default InventoryHeader;
