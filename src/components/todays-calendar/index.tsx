import './index.scss';
import { useSelector } from 'react-redux';
import { selectEvents, selectIsImporting } from '../../redux/eventsSlice';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const soothingBGColors = [
  '#FFEBEE', // Light Pink
  '#E8F5E9', // Light Green
  '#E3F2FD', // Light Blue
  '#E0F7FA', // Light Cyan
  '#F3E5F5', // Light Purple
  '#FFF3E0', // Light Orange
  '#F1F8E9', // Light Lime
  '#FCE4EC', // Light Rose
  '#EDE7F6', // Light Lavender
  '#F9FBE7', // Light Yellow
]

const TimeBlock = () => {
  const timeBlocks = Array.from({ length: 12 }, (_, index) => index + 9); 
  const todaysEvents = useSelector(selectEvents);
  const isImporting = useSelector(selectIsImporting);

  // Create a structure to hold events by hour
  const eventsByHour: { [key: number]: { title: string; description: string; start: number; end: number }[] } = {};

  todaysEvents.forEach(event => {
    const startHour = new Date(event.start).getHours();
    const endHour = new Date(event.end).getHours();

    for (let hour = startHour; hour < endHour; hour++) {
      if (!eventsByHour[hour]) {
        eventsByHour[hour] = [];
      }
      eventsByHour[hour].push({
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
      });
    }
  });

  return (
    <div className="time-blocks">
      {!isImporting && timeBlocks.map((hour) => (
        <div 
          key={hour} 
          className={'time-block'} 
        >
          <div className="box1">
            <div className="time-label">{hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? 'am' : 'pm'}</div>
          </div>
          <div className="box3">
            {eventsByHour[hour] && eventsByHour[hour].map((event, eventIndex) => (
              <div key={eventIndex} className="event-label" style={{ height: '100%', flex: 1, backgroundColor: soothingBGColors[eventIndex % soothingBGColors.length] }}>
                <div className='event-label-container'>
                <div className='event-label-line'></div>
                <div className='event-label-title'>
                  <span className='event-label-title-text'>{event.title}</span>
                  <span className='event-label-title-time'>{new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}</span>
                </div>
                </div>
              </div>
            ))}
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
