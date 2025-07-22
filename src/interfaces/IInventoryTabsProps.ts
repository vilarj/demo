import { InventoryAPI } from '../api';
import { TabType } from '../api/types/TabType';

export interface IInventoryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  inventorySystem: InventoryAPI;
}
