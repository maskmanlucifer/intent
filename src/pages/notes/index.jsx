import React, { useState, useRef } from "react";
import "./index.scss";
import Note from "../../components/note";
import { Button, Empty, Modal, Popconfirm } from "antd";
import { ReactComponent as Icon } from "../../images/empty-notes.svg";
import Editor from "../../components/notes-editor";
import { createId } from "../../helper";
import { useDispatch, useSelector } from "react-redux";
import { addNote, removeNote, selectNotes, updateNote } from "../../redux/notesSlice";
import classNames from "classnames";

const Title = ({note, onNoteSave}) => {

  const dispatch = useDispatch();
  
  const handleDeleteNote = () => {
    dispatch(removeNote(note.id));
  };

  return (
    <div className="editor-modal-title">
      <Popconfirm
            title="Are you sure you want to delete this note?"
            okText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteNote}
            description={null}
            placement="bottomRight"
          >
      <button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          color="#000000"
          fill="none"
        >
          <path
            d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M9.5 16.5L9.5 10.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M14.5 16.5L14.5 10.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
      </Popconfirm>
      <div className="editor-modal-footer">
        <div className="state">Saving changes...</div>
      </div>
      <button onClick={onNoteSave}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          color="#000000"
          fill="none"
        >
          <path
            d="M18 6L12 12M12 12L6 18M12 12L18 18M12 12L6 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

const Notes = () => {
  const notes = useSelector(selectNotes);
  const dispatch = useDispatch();

  const handleNewNoteCreation = () => {
    const id = createId();
    setModalData({
      open: true,
      editing: true,
      newNote: true,
      selectedNoteId: id,
    });
  };

  const [modalData, setModalData] = useState({
    open: false,
    editing: false,
    selectedNoteId: null,
    newNote: false,
  });

  const editorRef = useRef();

  const onNoteSave = () => {
    editorRef.current.save().then((outputData) => {
      const existingNote = notes.find(
        (note) => note.id === modalData.selectedNoteId
      );

      const finalNote = {
        id: modalData.selectedNoteId,
        createdAt: modalData.newNote
          ? new Date().toISOString()
          : existingNote.createdAt,
        data: JSON.stringify(outputData),
      };

      if (modalData.newNote) {
        dispatch(
          addNote({
            ...finalNote,
          })
        );
      } else {
        dispatch(
          updateNote({
            ...finalNote,
          })
        );
      }

      setModalData({
        open: false,
        editing: false,
        selectedNoteId: null,
        newNote: false,
      });
    });
  };

  const onEditNote = (id) => {
    setModalData({ open: true, editing: true, selectedNoteId: id });
  };

  const onViewNote = (id) => {
    setModalData({ open: true, editing: false, selectedNoteId: id });
  };

  const currentNote = notes.find(
    (note) => note.id === modalData.selectedNoteId
  );

  return (
    <div
      className={classNames("notes", {
        empty: notes.length === 0,
      })}
    >
      <div className={classNames("notes-wrapper")}>
        {notes.length > 0 && (
          <div className="add-note" onClick={handleNewNoteCreation}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              color="#1677ff"
              fill="none"
            >
              <path
                d="M12 4V20"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 12H20"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        )}
        {notes.map((note, index) => (
          <div key={index} className="note">
            <Note
              note={note}
              handleEditNote={onEditNote}
              handleViewNote={onViewNote}
            />
          </div>
        ))}
        {notes.length === 0 && (
          <div className="empty-state">
            <Empty
              image={<Icon />}
              imageStyle={{ height: 200, width: 200 }}
              description={"No notes found"}
            >
              <Button
                type="primary"
                size="small"
                onClick={handleNewNoteCreation}
              >
                Add new notes
              </Button>
            </Empty>
          </div>
        )}
        <Modal
          closable={false}
          maskClosable={false}
          title={<Title note={currentNote} onNoteSave={onNoteSave}/>}
          open={modalData.open}
          className="note-modal"
          onCancel={() => setModalData({ open: false })}
          onClose={() => setModalData({ open: false })}
          destroyOnClose={true}
          styles={{
            body: { height: "calc(100vh - 120px)", overflowY: "auto" },
          }}
          footer={null}
        >
          <Editor
            isEditing={modalData.editing}
            editorReference={editorRef}
            note={currentNote}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Notes;
