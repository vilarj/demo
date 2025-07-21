import { Modal } from 'antd';
import React from 'react';
import { IUnassignModalProps } from '../interfaces/IUnassignModalProps';

const UnassignModal: React.FC<IUnassignModalProps> = React.memo(
  ({ visible, selectedTool, employeeMap, onConfirm, onCancel }) => {
    return (
      <Modal
        title="Confirm Unassignment"
        open={visible}
        onOk={onConfirm}
        onCancel={onCancel}
        okText="Unassign"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        {selectedTool && (
          <div>
            <p>Are you sure you want to unassign this tool?</p>
            <p>
              <strong>Tool:</strong> {selectedTool.type} - {selectedTool.model} ({selectedTool.serialNumber})
            </p>
            {selectedTool.assignedTo && (
              <p>
                <strong>Currently assigned to:</strong> {employeeMap[selectedTool.assignedTo]?.name}
              </p>
            )}
          </div>
        )}
      </Modal>
    );
  },
);

export default UnassignModal;
