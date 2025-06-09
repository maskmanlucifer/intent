import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveReminders, syncSettings } from '../../redux/sessionSlice';
import { TReminderEvent } from '../../types';
import { CloseOutlined } from '@ant-design/icons';
import './index.scss';
import { getDateAndTime } from '../../utils';

const ReminderNotifications = () => {
  const activeReminders = useSelector(selectActiveReminders);

  const dismissReminder = useCallback((reminder: TReminderEvent) => {
    syncSettings({
      activeReminders: activeReminders.filter((r: TReminderEvent) => r.id !== reminder.id)
    });
  }, [activeReminders]);

  if(activeReminders.length === 0) {
    return null;
  }

  return (
    <div className="reminder-notifications">
      <div className="reminder-notifications-header">Today's Reminders</div>
      {[...activeReminders].map((reminder: TReminderEvent) => (
        <div key={reminder.id} className="reminder-notification">
          <div className="reminder-notification-title">{reminder.title}</div>
          {reminder.description && <div className="reminder-notification-description">{reminder.description}</div>}
          <div className="reminder-scheduled reminder-scheduled-timing">
          You meant to do this at <span className="reminder-scheduled-time">{getDateAndTime(reminder.date, reminder.time).formattedTime}</span>
          </div>
          <CloseOutlined onClick={() => dismissReminder(reminder)} />
        </div>
      ))}
    </div>
  );
};

export default ReminderNotifications; 