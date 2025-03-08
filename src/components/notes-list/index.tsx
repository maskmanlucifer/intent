import Masonry from 'react-masonry-css';
import './index.scss';
import { Note } from '../../types';
import NoteCard from '../note-card';
const MasonryGrid = ({ notes, onCardClick, onNoteDeleted }: { notes: Note[], onCardClick: (note: Note) => void, onNoteDeleted: () => void }) => {

  const breakpointColumns = {
    default: Math.floor((window.innerWidth - 16) / 348), // Adjusted for 8px space between cards
  };

  const masonryStyle = {
    marginBottom: '16px',
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
      style={masonryStyle}
    >
      {notes.map((note, index) => (
        <NoteCard key={index} note={note} index={index} onCardClick={onCardClick} onNoteDeleted={onNoteDeleted} />
      ))}
    </Masonry>
  );
};

export default MasonryGrid;
