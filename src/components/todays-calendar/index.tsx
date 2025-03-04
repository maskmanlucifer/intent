import './index.scss';
import { useSelector } from 'react-redux';
import { selectEvents, selectIsImporting } from '../../redux/eventsSlice';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { selectSettings } from '../../redux/sessionSlice';

const soothingBGColors = [
  '#FFF3E0', // Lighter Peach
  '#E8F5E9', // Lighter Mint
  '#E3F2FD', // Lighter Sky Blue
  '#E0F7FA', // Lighter Aqua
  '#F8BBD0', // Lighter Lavender Pink
  '#FFEBEE', // Lighter Apricot
  '#F1F8E9', // Lighter Olive
  '#FCE4EC', // Lighter Blush
  '#F3E5F5', // Lighter Orchid
  '#FFFDE7', // Lighter Cream
]

const TimeBlock = () => {
  const todaysEvents = useSelector(selectEvents);
  const isImporting = useSelector(selectIsImporting);
  const settings = useSelector(selectSettings);

  const { workingHours = ["09:00", "17:00"] } = settings;

  const arrayFrom9To10 = Array.from({ length: 12 }, (_, index) => index + 9);

  const finalBlcoks: number[] = [];

  const startHour = parseInt(workingHours[0].split(':')[0]);
  const endHour = parseInt(workingHours[1].split(':')[0]);

  arrayFrom9To10.forEach(hour => {
    if(hour >= startHour && hour <= endHour + 1) {
      finalBlcoks.push(hour);
    }
  });

  // Create a structure to hold events by hour
  const eventsByHour: { [key: number]: { title: string; description: string; start: number; end: number }[] } = {};

  todaysEvents.forEach(event => {
    const startHour = new Date(event.start).getHours();

    // Only consider the start hour for adding events
    if (!eventsByHour[startHour]) {
      eventsByHour[startHour] = [];
    }
    eventsByHour[startHour].push({
      title: event.title,
      description: event.description,
      start: event.start,
      end: event.end,
    });
  });


  return (
    <div className="time-blocks">
      {!isImporting && finalBlcoks.map((hour) => (
        <div 
          key={hour} 
          className={'time-block'} 
        >
          <div className="box1">
            <div className="time-label">{hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? 'am' : 'pm'}</div>
          </div>
          <div className="box3">
            {eventsByHour[hour] && eventsByHour[hour]
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .map((event, eventIndex) => {
                const timeDuration = (event.end - event.start) / (1000 * 60);
                return (
                  <div key={eventIndex} className="event-label" style={{ height: '100%', flex: 1, backgroundColor: soothingBGColors[Math.floor(Math.random() * soothingBGColors.length)] }}>
                    <div className='event-label-container'>
                      <div className='event-label-title'>
                        <span className='event-label-title-text'>{event.title}</span>
                        <span className='event-label-title-time'>
                          {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()} - 
                          {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()} ({timeDuration}m)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {isImporting && (
        <div className="importing-container">
          <Spin indicator={<LoadingOutlined spin />}/>
        </div>
      )}
    </div>
  );
};

export default TimeBlock;
