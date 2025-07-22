import { InventoryAPI } from '../api';
import { TabType } from '../api/types/TabType';

export interface IInventoryHeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  inventory: InventoryAPI;
  setSearchText: (text: string) => void;
}
