import { render, screen } from '@testing-library/react';
import { CalibrationStatus, isCalibrationExpired } from '../src/components/CalibrationStatus';
import { InventoryAPI } from '../src/api';

describe('CalibrationStatus', () => {
  it('renders correctly for overdue calibration', () => {
    const InventoryAPI = new InventoryAPI({}, {}, 0);

    render(<CalibrationStatus days={-5} toolId="T1" serialNumber="SN123" inventorySystem={InventoryAPI} />);

    expect(screen.getByText('overdue')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders correctly for due today', () => {
    const InventoryAPI = new InventoryAPI({}, {}, 0);

    render(<CalibrationStatus days={0} toolId="T1" serialNumber="SN123" inventorySystem={InventoryAPI} />);

    expect(screen.getByText('expires today')).toBeInTheDocument();
  });

  it('renders correctly for future dates', () => {
    const InventoryAPI = new InventoryAPI({}, {}, 0);

    render(<CalibrationStatus days={30} toolId="T1" serialNumber="SN123" inventorySystem={InventoryAPI} />);

    expect(screen.getByText('expires in 30 days')).toBeInTheDocument();
  });

  it('has download button', () => {
    const InventoryAPI = new InventoryAPI({}, {}, 0);

    render(<CalibrationStatus days={30} toolId="T1" serialNumber="SN123" inventorySystem={InventoryAPI} />);

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
