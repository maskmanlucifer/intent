import { Button, Modal } from "antd";
import { Note } from "../../types";
import "./index.scss";
import { DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { removeNote } from "../../redux/notesSlice";
import {ReactComponent as NoteIcon} from "../../assets/icons/note.svg";

const NoteCard = ({
  note,
  index,
  onCardClick,
  onNoteDeleted,
}: {
  note: Note;
  index: number;
  onCardClick: (note: Note) => void;
  onNoteDeleted: () => void;
}) => {
  const [isDialogVisible, setDialogVisible] = useState<boolean>(false);
  const dispatch = useDispatch();

  const handleDelete = () => {
    onNoteDeleted();
    dispatch(removeNote(note.id));
    setDialogVisible(false);
  };

  return (
    <div
      className="note-card"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isDialogVisible) {
          onCardClick(note);
        }
      }}
    >
      <Button
        type="primary"
        className="delete-button"
        danger
        icon={<DeleteOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setDialogVisible(true);
        }}
      />
      <div className="square">
        <NoteIcon />
      </div>
      <span className="title">{note.title}</span>
      <span className="subtitle">{note.subtitle}</span>
      <Modal
        title="Confirm Deletion"
        open={isDialogVisible}
        centered={true}
        onOk={handleDelete}
        onCancel={() => setDialogVisible(false)}
        footer={
          <div className="modal-footer">
            <Button
              type="default"
              onClick={() => setDialogVisible(false)}
              size="small"
            >
              Cancel
            </Button>
            <Button type="primary" danger onClick={handleDelete} size="small">
              Delete
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, padding: 0 }}>
          Are you sure you want to delete this note?
        </p>
      </Modal>
    </div>
  );
};

export default NoteCard;
