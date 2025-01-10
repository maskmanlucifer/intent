import React, { useState, useRef } from "react";
import "./index.scss";
import Note from "../../components/note";
import { Button, Empty, Modal } from "antd";
import { ReactComponent as Icon } from "../../images/empty-notes.svg";
import Editor from "../../components/notes-editor";
import { createId } from "../../helper";
import { useDispatch, useSelector } from "react-redux";
import { addNote, selectNotes, updateNote } from "../../redux/notesSlice";
import UserContextInfo from "../../components/context-info";

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
        title: document.getElementById("title-input").innerText,
        subtitle: outputData?.blocks?.[0]?.data?.text || "",
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
    <div className="notes">
      <div className="notes-wrapper">
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
          title={
            modalData.editing ? (
              <div id="title-input" contentEditable>
                {currentNote?.title || "Untitled Note"}
              </div>
            ) : (
              <span className="modal-title">{currentNote?.title}</span>
            )
          }
          open={modalData.open}
          className="note-modal"
          onCancel={() => setModalData({ open: false })}
          onClose={() => setModalData({ open: false })}
          destroyOnClose={true}
          footer={[
            modalData.editing && modalData.newNote ? (
              <Button
                key="back"
                onClick={() => setModalData({ open: false })}
              >
                Cancel
              </Button>
            ) : null,
            modalData.editing ? (
              <Button key="submit" type="primary" onClick={onNoteSave}>
                Save
              </Button>
            ) : (
              <Button
                key="back"
                type="primary"
                onClick={() => setModalData({ open: false })}
              >
                Close
              </Button>
            ),
          ]}
        >
          <Editor
            isEditing={modalData.editing}
            editorReference={editorRef}
            note={currentNote}
          />
        </Modal>
      </div>
      <UserContextInfo position="top" />
    </div>
  );
};

export default Notes;
