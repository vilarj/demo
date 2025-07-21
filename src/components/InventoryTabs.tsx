import React from 'react';
import { IInventoryTabsProps } from '../interfaces/IInventoryTabsProps';
import { TabType } from '../types/TabType';

const InventoryTabs: React.FC<IInventoryTabsProps> = React.memo(({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'all' as TabType, label: 'All' },
    { key: 'assigned' as TabType, label: 'Assigned' },
    { key: 'available' as TabType, label: 'Available' },
  ];

  return (
    <div className="flex space-x-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`pb-2 px-4 border-b-2 font-bold text-sm cursor-pointer transition-colors duration-100 ${
            activeTab === tab.key
              ? 'border-blue-500 text-blue-600'
              : 'border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400'
          }`}
        >
          <span className="flex items-center space-x-2">{tab.label}</span>
        </button>
      ))}
    </div>
  );
});

export default InventoryTabs;
