import { DownloadOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip, message } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { ToolId } from '../api';
import { ICalibrationStatusProps } from '../interfaces/ICalibrationStatusProps';

/**
 * `CalibrationStatus` displays the calibration status of a tool based on the number of days until its expiration.
 * It provides a clear status label (e.g., 'overdue', 'expires in 5 days', 'expires today') and offers
 * a button to download a calibration certificate as a PDF from the backend.
 *
 * @component
 * @param {ICalibrationStatusProps} props - The component's properties.
 * @param {number} props.days - The number of days until calibration expires. A negative value indicates
 * the calibration is overdue.
 * @param {string} props.toolId - The unique identifier of the tool.
 * @param {string} props.serialNumber - The serial number of the tool.
 * @param {MockInventorySystem} props.inventorySystem - The inventory system instance for backend operations.
 *
 * @returns {React.FC<ICalibrationStatusProps>} A React functional component that renders the calibration status.
 *
 */
const CalibrationStatus: React.FC<ICalibrationStatusProps> = React.memo(({ days, toolId, inventorySystem }) => {
  /**
   * Determines the calibration status text and color based on the number of days until expiration.
   *
   * @param {number} days - The number of days until calibration expires. Negative values mean overdue.
   * @returns {{ color: string; text: string }} An object containing the color and descriptive text for the status.
   */
  const getCalibrationStatus = (days: number): { color: string; text: string } => {
    if (days < 0) {
      const pastDays = Math.abs(days);
      return {
        color: 'red',
        text: pastDays === 1 ? '1 day overdue' : 'overdue',
      };
    }

    if (days === 0) {
      return { color: 'orange', text: 'expires today' };
    }

    if (days === 1) {
      return { color: 'orange', text: 'expires tomorrow' };
    }

    if (days <= 7) {
      return { color: 'orange', text: `expires in ${days} days` };
    }

    if (days <= 30) {
      return { color: 'black', text: `expires in ${days} days` };
    }

    // For longer periods, show in months for better readability
    const months = Math.floor(days / 30);
    return { color: 'black', text: `expires in ${months} month${months !== 1 ? 's' : ''}` };
  };

  /**
   * Handles the download of a calibration certificate as a PDF from the backend.
   * Shows loading state and handles errors gracefully.
   */
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    if (downloading) return;

    setDownloading(true);
    try {
      const result = await inventorySystem.downloadCalibrationCertificate(toolId as ToolId);

      if (result.ok) {
        // Create a blob URL and trigger download
        const url = URL.createObjectURL(result.pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        message.success('Certificate downloaded successfully');
      } else {
        message.error(`Failed to download certificate: ${result.error}`);
      }
    } catch (error) {
      message.error('An error occurred while downloading the certificate');
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  }, [toolId, inventorySystem, downloading]);

  /**
   * Memoized calibration status to prevent unnecessary recalculations
   * when the `days` prop does not change.
   */
  const status = useMemo(() => getCalibrationStatus(days), [days]);

  return (
    <Space
      size={0}
      className="w-full max-w-40"
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      <span
        className={`text-left ${
          status.color === 'red' ? 'text-red-500' : status.color === 'orange' ? 'text-orange-500' : 'text-black'
        }`}
        style={{ flex: 1, minWidth: 0 }}
      >
        {status.text}
      </span>
      <Tooltip title="Download calibration certificate">
        <Button
          type="text"
          size="small"
          icon={<DownloadOutlined />}
          onClick={handleDownloadPDF}
          loading={downloading}
          disabled={downloading}
          style={{ flexShrink: 0, marginLeft: '8px' }}
        />
      </Tooltip>
    </Space>
  );
});

/**
 * Checks if the calibration is expired based on the number of days.
 *
 * @param {number} days - Number of days until calibration expires (negative means expired).
 * @returns {boolean} True if calibration is expired, false otherwise.
 */
export const isCalibrationExpired = (days: number): boolean => {
  return days < 0;
};

export { CalibrationStatus };
