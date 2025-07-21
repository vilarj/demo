import { render, screen } from '@testing-library/react';
import { CalibrationStatus, isCalibrationExpired } from '../src/components/CalibrationStatus';
import { MockInventorySystem } from '../src/inventory-api';

describe('CalibrationStatus', () => {
  it('renders correctly for overdue calibration', () => {
    const mockInventorySystem = new MockInventorySystem({}, {}, 0);

    render(<CalibrationStatus days={-5} toolId="T1" serialNumber="SN123" inventorySystem={mockInventorySystem} />);

    expect(screen.getByText('overdue')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders correctly for due today', () => {
    const mockInventorySystem = new MockInventorySystem({}, {}, 0);

    render(<CalibrationStatus days={0} toolId="T1" serialNumber="SN123" inventorySystem={mockInventorySystem} />);

    expect(screen.getByText('expires today')).toBeInTheDocument();
  });

  it('renders correctly for future dates', () => {
    const mockInventorySystem = new MockInventorySystem({}, {}, 0);

    render(<CalibrationStatus days={30} toolId="T1" serialNumber="SN123" inventorySystem={mockInventorySystem} />);

    expect(screen.getByText('expires in 30 days')).toBeInTheDocument();
  });

  it('has download button', () => {
    const mockInventorySystem = new MockInventorySystem({}, {}, 0);

    render(<CalibrationStatus days={30} toolId="T1" serialNumber="SN123" inventorySystem={mockInventorySystem} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});

describe('isCalibrationExpired', () => {
  it('returns true for negative days', () => {
    expect(isCalibrationExpired(-1)).toBe(true);
    expect(isCalibrationExpired(-10)).toBe(true);
  });

  it('returns false for zero or positive days', () => {
    expect(isCalibrationExpired(0)).toBe(false);
    expect(isCalibrationExpired(1)).toBe(false);
    expect(isCalibrationExpired(30)).toBe(false);
  });
});
