import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';
import { IToolActionsProps } from '../interfaces/IToolActionsProps';

/**
 * `EditAction` is a functional component that renders a set of action buttons for managing
 * tool assignments within an inventory table. These actions include "Assign", "Reassign",
 * "Unassign", "Save", and "Cancel", with their visibility and enabled states
 * dynamically controlled based on the current editing context and tool status.
 *
 * @component
 * @param {IToolActionsProps} props - The properties passed to the component.
 * @param {boolean} props.isEditing - A boolean indicating if the current row is in an editing state.
 * @param {boolean} props.isAssigned - A boolean indicating if the tool is currently assigned to someone.
 * @param {boolean} props.calibrationExpired - A boolean indicating if the tool's calibration has expired.
 * @param {boolean} props.isOtherRowEditing - A boolean indicating if another row in the table is currently being edited.
 * @param {boolean} props.hasChanges - A boolean indicating if there are unsaved changes in the current editing row.
 * @param {() => void} props.onEdit - Callback function to be invoked when the "Assign" or "Reassign" button is clicked,
 * initiating the editing mode for the row.
 * @param {() => void} props.onSave - Callback function to be invoked when the "Save" button is clicked,
 * persisting the changes made in editing mode.
 * @param {() => void} props.onCancel - Callback function to be invoked when the "Cancel" button is clicked,
 * discarding changes and exiting editing mode.
 * @param {() => void} props.onUnassign - Callback function to be invoked when the "Unassign" button is clicked,
 * removing the current assignment of the tool.
 *
 * @returns {React.FC<IToolActionsProps>} A React functional component displaying action buttons.
 *
 * @example
 * ```tsx
 * <EditAction
 * isEditing={false}
 * isAssigned={true}
 * calibrationExpired={false}
 * isOtherRowEditing={false}
 * hasChanges={false}
 * onEdit={() => console.log('Edit clicked')}
 * onSave={() => console.log('Save clicked')}
 * onCancel={() => console.log('Cancel clicked')}
 * onUnassign={() => console.log('Unassign clicked')}
 * />
 * ```
 */
const EditAction: React.FC<IToolActionsProps> = React.memo(
  ({
    isEditing,
    isAssigned,
    calibrationExpired,
    isOtherRowEditing,
    hasChanges,
    onEdit,
    onSave,
    onCancel,
    onUnassign,
  }) => {
    if (isEditing) {
      return (
        <Space size="small" className="flex justify-center w-full">
          <Button
            size="small"
            icon={<SaveOutlined />}
            onClick={onSave}
            disabled={!hasChanges}
            className={`px-2 text-xs !bg-[#00aff0] !text-white !hover:bg-[#0099cc] ${!hasChanges ? '!bg-gray-200 !text-gray-400 !cursor-not-allowed' : ''}`}
            style={{ minWidth: '60px' }}
          >
            Save
          </Button>
          <span className="text-gray-300">|</span>
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={onCancel}
            className="px-2 text-xs !bg-red-500 !text-white !hover:bg-red-600"
            style={{ minWidth: '60px' }}
          >
            Cancel
          </Button>
        </Space>
      );
    }

    return (
      <Space size="small" className="flex justify-center w-full flex-wrap">
        {isAssigned ? (
          <>
            <Button
              className={`px-2 text-xs ${calibrationExpired || isOtherRowEditing ? 'text-gray-300' : 'text-[#00aff0]'}`}
              type="link"
              size="small"
              onClick={onEdit}
              disabled={!!calibrationExpired || !!isOtherRowEditing}
              style={{ minWidth: '55px', padding: '0 4px' }}
            >
              reassign
            </Button>
            <span className="text-gray-300">|</span>
            <Button
              className={`px-2 text-xs ${isOtherRowEditing ? 'text-gray-300' : 'text-[#00aff0]'}`}
              type="link"
              size="small"
              onClick={onUnassign}
              disabled={!!isOtherRowEditing}
              style={{ minWidth: '55px', padding: '0 4px' }}
            >
              unassign
            </Button>
          </>
        ) : (
          <Button
            className={`px-2 text-xs ${calibrationExpired || isOtherRowEditing ? 'text-gray-300' : 'text-[#00aff0]'}`}
            type="link"
            size="small"
            onClick={onEdit}
            disabled={calibrationExpired || !!isOtherRowEditing}
            style={{ minWidth: '50px', padding: '0 4px' }}
          >
            assign
          </Button>
        )}
      </Space>
    );
  },
);

export default EditAction;
