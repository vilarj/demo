import { DownloadOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import jsPDF from 'jspdf';
import React, { useCallback, useMemo } from 'react';
import { ICalibrationStatusProps } from '../interfaces/ICalibrationStatusProps';

dayjs.extend(relativeTime);

const CalibrationStatus: React.FC<ICalibrationStatusProps> = React.memo(({ days }) => {
  const getCalibrationStatus = (days: number): { color: string; text: string } => {
    if (days < 0) return { color: 'red', text: 'overdue' };
    const now = dayjs();
    const expiration = now.add(days, 'day');
    let text = expiration.from(now);
    if (days === 0) text = 'today';
    let color = 'black';
    return { color, text };
  };

  const getExpirationDateString = (days: number): string => {
    const now = dayjs().startOf('day');
    return now.add(days, 'day').format('YYYY-MM-DD');
  };

  const handleDownloadPDF = useCallback(() => {
    const expirationDate = getExpirationDateString(days);
    const doc = new jsPDF();
    doc.text('Calibration Certificate Download Test', 10, 10);
    doc.save(`Calibration_Certificate_${expirationDate}.pdf`);
  }, [days]);

  const status = useMemo(() => getCalibrationStatus(days), [days]);

  return (
    <Space>
      <span style={{ color: status.text === 'overdue' ? 'red' : status.color }}>{status.text}</span>
      <Tooltip title="Download calibration certificate">
        <Button type="text" size="small" icon={<DownloadOutlined />} onClick={handleDownloadPDF} />
      </Tooltip>
    </Space>
  );
});

export { CalibrationStatus };

export const isCalibrationExpired = (days: number): boolean => {
  return days < 0;
};
