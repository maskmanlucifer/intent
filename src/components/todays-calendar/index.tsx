import './index.scss';
import { useSelector } from 'react-redux';
import { selectEvents, selectIsImporting } from '../../redux/eventsSlice';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { selectSettings } from '../../redux/sessionSlice';

// Improved color palette with accessible text colors
const colorPalette = [
  { bg: '#FFF5E6', text: '#4A3933' }, // Soft Peach
  { bg: '#E6F3E9', text: '#2C4A3A' }, // Sage Mint
  { bg: '#E6F2FF', text: '#1F3A5F' }, // Pastel Blue
  { bg: '#E0F4F5', text: '#2B5E5E' }, // Pale Teal
  { bg: '#F4E1E8', text: '#5A2E4C' }, // Soft Rose
  { bg: '#FFF0E5', text: '#4D3E3A' }, // Warm Apricot
  { bg: '#F0F4E6', text: '#3A4A2E' }, // Light Sage
  { bg: '#F7E6EC', text: '#4E2A3E' }, // Soft Mauve
  { bg: '#F2E5F4', text: '#44335A' }, // Lilac Whisper
  { bg: '#FFFBE6', text: '#4A4430' }  // Warm Cream
];

const TimeBlock = () => {
  const todaysEvents = useSelector(selectEvents);
  const isImporting = useSelector(selectIsImporting);
  const settings = useSelector(selectSettings);

  const { workingHours = ["09:00", "17:00"] } = settings;

  const arrayFrom9To10 = Array.from({ length: 12 }, (_, index) => index + 9);

  const finalBlocks: number[] = [];

  const startHour = parseInt(workingHours[0].split(':')[0]);
  const endHour = parseInt(workingHours[1].split(':')[0]);

  arrayFrom9To10.forEach(hour => {
    if(hour >= startHour && hour <= endHour + 1) {
      finalBlocks.push(hour);
    }
  });

  // Deterministic color selection function
  const getEventColor = (eventId: string) => {
    // Create a simple hash function to generate a consistent index
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    };

    // Use the hash to select a consistent color
    const colorIndex = hashCode(eventId) % colorPalette.length;
    return colorPalette[colorIndex];
  };

  // Create a structure to hold events by hour
  const eventsByHour: { [key: number]: { id: string; title: string; description: string; start: number; end: number }[] } = {};

  todaysEvents.forEach(event => {
    const startHour = new Date(event.start).getHours();

    // Only consider the start hour for adding events
    if (!eventsByHour[startHour]) {
      eventsByHour[startHour] = [];
    }
    eventsByHour[startHour].push({
      id: event.id || `${event.title}-${event.start}`, // Ensure a unique identifier
      title: event.title,
      description: event.description,
      start: event.start,
      end: event.end,
    });
  });

  return (
    <div className="time-blocks">
      {!isImporting && finalBlocks.map((hour) => (
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
                const eventColor = getEventColor(event.id);
                
                return (
                  <div 
                    key={eventIndex} 
                    className="event-label" 
                    style={{ 
                      backgroundColor: eventColor.bg, 
                      color: eventColor.text 
                    }}
                  >
                    <div className='event-label-container'>
                      <div className='event-label-title'>
                        <span className='event-label-title-text'>{event.title}</span>
                        <span className='event-label-title-time'>
                          {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                          {' - '} 
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