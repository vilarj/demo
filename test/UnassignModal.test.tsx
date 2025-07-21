import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnassignModal from '../src/components/UnassignModal';
import { type Employee, type EmployeeId, type Tool } from '../src/inventory-api';

describe('UnassignModal', () => {
  const mockTool: Tool = {
    id: 'T1',
    type: 'HydraulicWrench',
    model: 'HW-100',
    serialNumber: 'SN123',
    calibrationDueDate: '2025-12-01',
    assignedTo: 'E1' as EmployeeId,
    assignedOn: '2025-06-01',
  };

  const mockEmployeeMap: Record<EmployeeId, Employee> = {
    E1: { id: 'E1', name: 'John Doe' },
  };

  let mockOnConfirm: jest.Mock;
  let mockOnCancel: jest.Mock;

  beforeEach(() => {
    mockOnConfirm = jest.fn();
    mockOnCancel = jest.fn();
  });

  it('renders modal when visible is true', () => {
    render(
      <UnassignModal
        visible={true}
        selectedTool={mockTool}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText('Confirm Unassignment')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to unassign this tool?')).toBeInTheDocument();
  });

  it('does not render modal when visible is false', () => {
    render(
      <UnassignModal
        visible={false}
        selectedTool={mockTool}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.queryByText('Confirm Unassignment')).not.toBeInTheDocument();
  });

  it('displays tool information correctly', () => {
    render(
      <UnassignModal
        visible={true}
        selectedTool={mockTool}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText('Tool:')).toBeInTheDocument();
    expect(screen.getByText('HydraulicWrench - HW-100 (SN123)')).toBeInTheDocument();
  });

  it('displays assigned employee information', () => {
    render(
      <UnassignModal
        visible={true}
        selectedTool={mockTool}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText('Currently assigned to:')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('does not display assigned employee when tool is not assigned', () => {
    const unassignedTool: Tool = {
      ...mockTool,
      assignedTo: null,
      assignedOn: null,
    };

    render(
      <UnassignModal
        visible={true}
        selectedTool={unassignedTool}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.queryByText('Currently assigned to:')).not.toBeInTheDocument();
  });

  it('calls onConfirm when Unassign button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <UnassignModal
        visible={true}
        selectedTool={mockTool}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const unassignButton = screen.getByRole('button', { name: 'Unassign' });
    await user.click(unassignButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <UnassignModal
        visible={true}
        selectedTool={mockTool}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when modal X button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <UnassignModal
        visible={true}
        selectedTool={mockTool}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('handles missing employee in employee map gracefully', () => {
    const toolWithMissingEmployee: Tool = {
      ...mockTool,
      assignedTo: 'E999' as EmployeeId,
    };

    render(
      <UnassignModal
        visible={true}
        selectedTool={toolWithMissingEmployee}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText('Currently assigned to:')).toBeInTheDocument();
  });

  it('renders danger styling on Unassign button', () => {
    render(
      <UnassignModal
        visible={true}
        selectedTool={mockTool}
        employeeMap={mockEmployeeMap}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    const unassignButton = screen.getByRole('button', { name: 'Unassign' });
    expect(unassignButton).toHaveClass('ant-btn-dangerous');
  });
});
