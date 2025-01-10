import React from "react";
import "./index.scss";
import { Button, Card, Popconfirm } from "antd";
import { DeleteTwoTone, EyeTwoTone } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { removeNote } from "../../redux/notesSlice";

const getCreatedTime = (epochTime) => {
  const date = new Date(epochTime);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const formattedDateTime = `${day} ${month} ${year}`;
  return formattedDateTime;
};

const Note = ({ handleViewNote, handleEditNote, note }) => {
  const dispatch = useDispatch();

  const handleDeleteNote = () => {
    dispatch(removeNote(note.id));
  };

  const onEditNote = () => {
    handleEditNote(note.id);
  };

  const onViewNote = () => {
    handleViewNote(note.id);
  };

  return (
    <div className="note-item">
      <Card
        title={<span className="card-time">
          Created at {getCreatedTime(note.createdAt)}
        </span>}
        extra={
          <Button
          className="edit-note-btn"
          type="link"
          size="small"
          onClick={onEditNote}
        >
          Edit
        </Button>
        }
        style={{ width: 320 }}
        actions={[
          <Button
            className="edit-note-btn"
            type="link"
            size="small"
            onClick={onViewNote}
          >
            <EyeTwoTone />
          </Button>,
          <Popconfirm
            title="Are you sure you want to delete this note?"
            okText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteNote}
            description={null}
          >
            <Button className="edit-note-btn" type="link" size="small">
              <DeleteTwoTone />
            </Button>
          </Popconfirm>,
        ]}
      >
        <span className="heading">{note.title}</span>
        <span className="sub-heading">{note.subtitle}</span>
      </Card>
    </div>
  );
};

export default Note;
