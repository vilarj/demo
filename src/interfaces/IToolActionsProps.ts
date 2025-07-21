export interface IToolActionsProps {
  isEditing: boolean;
  isAssigned: boolean;
  calibrationExpired: boolean;
  isOtherRowEditing: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUnassign: () => void;
}
