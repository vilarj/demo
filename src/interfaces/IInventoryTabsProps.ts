import { MockInventorySystem } from '../inventory-api';
import { TabType } from '../types/TabType';

export interface IInventoryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  inventorySystem: MockInventorySystem;
}
