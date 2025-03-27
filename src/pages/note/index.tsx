import { Button, Empty, InputRef, Layout, Modal, message, Tooltip } from "antd";
import "./index.scss";
import { ReactComponent as EmptyNote } from "../../assets/images/empty-notes.svg";
import { useDispatch, useSelector } from "react-redux";
import { addNote, selectNotes, updateNote } from "../../redux/notesSlice";
import NotesList from "../../components/notes-list";
import { createNewNote } from "../../helper";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useRef } from "react";
import { Note as NoteType } from "../../types";
import EditNoteComponent from "../../components/EditNoteModal";
import ModalFooter from "../../components/EditNoteModal/modal-footer";
import EditorJS from "@editorjs/editorjs";
import ModalTitle from "../../components/EditNoteModal/modal-title";

const Note = () => {
  const notes = useSelector(selectNotes);
  const [editNoteModalData, setEditNoteModalData] = useState<{
    isOpen: boolean;
    note: NoteType | null;
  }>({ isOpen: false, note: null });
  const headerInputRef = useRef<InputRef>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const handleAddNote = () => {
    const newNote = createNewNote();
    setEditNoteModalData({
      isOpen: true,
      note: newNote,
    });
    setIsEditing(true);
  };

  const handleGoBack = () => {
    setEditNoteModalData({
      isOpen: false,
      note: null,
    });
    if (isEditing) {
      setIsEditing(false);
    }
  };

  const handleAction = async () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      const headerText = headerInputRef.current?.input?.value;
      const content = await editorRef.current?.save();
      const { blocks } = (await editorRef.current?.save()) || { blocks: [] };
      const subtitle = blocks
        .map((block) => block.data.text)
        .join(" ")
        .split(" ")
        .slice(0, 40)
        .join(" ");

      const finalNote = {
        ...editNoteModalData.note,
        title: headerText,
        subtitle: subtitle,
        content: JSON.stringify(content),
        updatedAt: Date.now(),
      };

      if (editNoteModalData.note?.isNewNote) {
        delete finalNote.isNewNote;
        dispatch(addNote(finalNote));
        messageApi.success("Note created successfully");
      } else {
        dispatch(updateNote(finalNote));
        messageApi.success("Note updated successfully");
      }

      setEditNoteModalData({
        isOpen: false,
        note: null,
      });
      setIsEditing(false);
    }
  };

  const handleCardClick = (note: NoteType) => {
    setEditNoteModalData({
      isOpen: true,
      note: note,
    });
  };

  const onNoteDeleted = () => {
    messageApi.success("Note deleted successfully");
  }

  return (
    <div className="note-page">
      {contextHolder}
      <Layout>
        <div className="note-items">
          {notes.length > 0 && (
            <div className="note-header">
              <span>NOTES</span>
              <Tooltip
                title="Add new note"
                mouseEnterDelay={0}
                mouseLeaveDelay={0}
                placement="left"
                arrow={false}
              >
                <Button
                  size="small"
                  type="primary"
                  onClick={handleAddNote}
                  icon={<PlusOutlined />}
                />
              </Tooltip>
            </div>
          )}
          {notes.length === 0 && (
            <div className="empty-note">
              <Empty
                image={<EmptyNote />}
                description={
                  <span>No notes available. Feel free to create one! 🔖</span>
                }
              >
                <Button type="primary" size="small" onClick={handleAddNote}>
                  Add new note
                </Button>
              </Empty>
            </div>
          )}
          {notes.length > 0 && (
            <NotesList notes={notes} onCardClick={handleCardClick} onNoteDeleted={onNoteDeleted} />
          )}
        </div>
      </Layout>
      <Modal
        className="note-modal"
        open={editNoteModalData.isOpen}
        onCancel={() => {}}
        footer={
          <ModalFooter
            isEditing={isEditing}
            isNewNote={!!editNoteModalData.note?.isNewNote}
            onAction={handleAction}
            onGoBack={handleGoBack}
          />
        }
        width={1000}
        destroyOnClose={true}
        title={
          <ModalTitle
            isEditing={isEditing}
            isNewNote={!!editNoteModalData.note?.isNewNote}
            onClose={handleGoBack}
          />
        }
        centered={true}
        closeIcon={null}
        closable={false}
        maskClosable={false}
      >
        <EditNoteComponent
          note={editNoteModalData.note}
          isEditing={isEditing}
          headerRef={headerInputRef}
          editorRef={editorRef}
        />
      </Modal>
    </div>
  );
};

export default Note;
