import { Modal, Space, Typography } from 'antd';
import React from 'react';
import { IUnassignModalProps } from '../interfaces/IUnassignModalProps';

const { Text, Paragraph } = Typography;

/**
 * `UnassignModal` Component
 *
 * A confirmation dialog modal that allows users to unassign a tool from an employee.
 * Uses Ant Design's Modal component with danger styling to emphasize the destructive nature
 * of the unassign action.
 *
 * @component
 *
 * @param props - Component props
 * @param props.visible - Controls the visibility of the modal
 * @param props.selectedTool - The tool object to be unassigned (can be null)
 * @param props.employeeMap - Map of employee IDs to employee objects for lookup
 * @param props.onConfirm - Callback function executed when user confirms unassignment
 * @param props.onCancel - Callback function executed when user cancels the modal
 *
 * @returns JSX.Element representing the unassign confirmation modal
 *
 * @remarks
 * - The modal only renders tool details when selectedTool is not null
 * - Employee information is displayed only if the tool is currently assigned
 * - Uses React.memo for performance optimization to prevent unnecessary re-renders
 * - The "Unassign" button is styled with danger props to indicate destructive action
 */
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
          <Space direction="vertical" size="small">
            <Paragraph>Are you sure you want to unassign this tool?</Paragraph>

            {/* Tool Information Display */}
            <Paragraph>
              <Text strong>Tool:</Text> {selectedTool.type} - {selectedTool.model} ({selectedTool.serialNumber})
            </Paragraph>

            {/* Current Assignment Information - Only shown if tool is assigned */}
            {selectedTool.assignedTo && (
              <Paragraph>
                <Text strong>Currently assigned to:</Text> {employeeMap[selectedTool.assignedTo]?.name}
              </Paragraph>
            )}
          </Space>
        )}
      </Modal>
    );
  },
);

export default UnassignModal;
