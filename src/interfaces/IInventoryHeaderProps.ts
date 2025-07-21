import { MockInventorySystem } from '../inventory-api';
import { TabType } from '../types/TabType';

export interface IInventoryHeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  inventory: MockInventorySystem;
  setSearchText: (text: string) => void;
}
