import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditAction from '../src/components/EditAction';

describe('EditAction', () => {
  const defaultProps = {
    isEditing: false,
    isAssigned: false,
    calibrationExpired: false,
    isOtherRowEditing: false,
    hasChanges: false,
    onEdit: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onUnassign: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when not editing', () => {
    it('shows assign button for unassigned tool', () => {
      render(<EditAction {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'assign' })).toBeInTheDocument();
    });

    it('shows reassign and unassign buttons for assigned tool', () => {
      render(<EditAction {...defaultProps} isAssigned={true} />);

      expect(screen.getByRole('button', { name: 'reassign' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'unassign' })).toBeInTheDocument();
    });

    it('disables buttons when calibration is expired', () => {
      render(<EditAction {...defaultProps} calibrationExpired={true} />);

      const assignButton = screen.getByRole('button', { name: 'assign' });
      expect(assignButton).toBeDisabled();
      expect(assignButton).toHaveClass('text-gray-300');
    });

    it('disables buttons when other row is editing', () => {
      render(<EditAction {...defaultProps} isOtherRowEditing={true} />);

      const assignButton = screen.getByRole('button', { name: 'assign' });
      expect(assignButton).toBeDisabled();
    });

    it('calls onEdit when assign button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditAction {...defaultProps} />);

      const assignButton = screen.getByRole('button', { name: 'assign' });
      await user.click(assignButton);

      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onEdit when reassign button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditAction {...defaultProps} isAssigned={true} />);

      const reassignButton = screen.getByRole('button', { name: 'reassign' });
      await user.click(reassignButton);

      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onUnassign when unassign button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditAction {...defaultProps} isAssigned={true} />);

      const unassignButton = screen.getByRole('button', { name: 'unassign' });
      await user.click(unassignButton);

      expect(defaultProps.onUnassign).toHaveBeenCalledTimes(1);
    });
  });

  describe('when editing', () => {
    it('shows save and cancel buttons', () => {
      render(<EditAction {...defaultProps} isEditing={true} />);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('disables save button when there are no changes', () => {
      render(<EditAction {...defaultProps} isEditing={true} hasChanges={false} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveClass('!bg-gray-200');
      expect(saveButton).toHaveClass('!text-gray-400');
    });

    it('enables save button when there are changes', () => {
      render(<EditAction {...defaultProps} isEditing={true} hasChanges={true} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('calls onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditAction {...defaultProps} isEditing={true} hasChanges={true} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditAction {...defaultProps} isEditing={true} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('renders cancel button with red color', () => {
      render(<EditAction {...defaultProps} isEditing={true} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toHaveClass('!bg-red-500');
    });
  });
});
