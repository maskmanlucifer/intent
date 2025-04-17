import { Select } from 'antd';
import moment from 'moment-timezone';
import { FC, useMemo } from 'react';

interface TimeZonePickerProps {
  value?: string | null;
  onChange?: (value: string) => void;
}

const timeZones = [
    'UTC',
    // America
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    // Europe
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    // Asia
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Australia/Sydney',
    // Middle East
    'Asia/Dubai',
    'Asia/Riyadh',
    'Asia/Baghdad',
    'Asia/Tehran',
    'Asia/Jerusalem',
    'Asia/Amman',
    'Asia/Kuwait',
    'Asia/Bahrain',
    'Asia/Qatar',
    'Asia/Muscat',
  ];

const formatTimeZone = (tz: string) => {
  const offset = moment.tz(tz).format('Z');
  return `${tz} (UTC${offset})`;
}

const TimeZonePicker: FC<TimeZonePickerProps> = ({ value, onChange }) => {
  const options = useMemo(() => {
    return timeZones.map((tz) => {
        
      return {
        label: formatTimeZone(tz),
        value: tz,
      };
    });
  }, []);

  return (
    <Select
      style={{ width: 300 }}
      size='small'
      placeholder="Select Time Zone"
      value={formatTimeZone(value || moment.tz.guess())}
      onChange={onChange}
      options={options}
      optionFilterProp="label"
      showSearch
    />
  );
};

export default TimeZonePicker;
