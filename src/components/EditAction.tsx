import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';
import { IToolActionsProps } from '../interfaces/IToolActionsProps';

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
        <Space>
          <Button
            type="text"
            size="small"
            icon={<SaveOutlined />}
            onClick={onSave}
            disabled={!hasChanges}
            style={{ color: hasChanges ? 'green' : 'gray' }}
          >
            save
          </Button>
          <span>|</span>
          <Button type="text" size="small" icon={<CloseOutlined />} onClick={onCancel} style={{ color: 'red' }}>
            cancel
          </Button>
        </Space>
      );
    }

    const buttonStyle = isOtherRowEditing ? { color: '#d9d9d9' } : {};

    return (
      <Space>
        {isAssigned ? (
          <>
            <Button
              style={{
                ...buttonStyle,
                color: calibrationExpired || isOtherRowEditing ? '#d9d9d9' : 'blue',
              }}
              type="link"
              size="small"
              onClick={onEdit}
              disabled={!!calibrationExpired || !!isOtherRowEditing}
            >
              reassign
            </Button>
            <span style={buttonStyle}>|</span>
            <Button
              style={{
                ...buttonStyle,
                color: isOtherRowEditing ? '#d9d9d9' : 'blue',
              }}
              type="link"
              size="small"
              onClick={onUnassign}
              disabled={!!isOtherRowEditing}
            >
              unassign
            </Button>
          </>
        ) : (
          <Button
            style={{
              ...buttonStyle,
              color: calibrationExpired || isOtherRowEditing ? '#d9d9d9' : 'blue',
            }}
            type="link"
            size="small"
            onClick={onEdit}
            disabled={calibrationExpired || !!isOtherRowEditing}
          >
            assign
          </Button>
        )}
      </Space>
    );
  },
);

EditAction.displayName = 'EditAction';

export default EditAction;
