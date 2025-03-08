import Editor from "../notes-editor";
import { Note as NoteType } from "../../types";
import { useState, useEffect } from "react";
import EditorJS from "@editorjs/editorjs";
import { Input, InputRef } from "antd";

const EditNoteComponent = ({ note, isEditing, headerRef, editorRef }: { note: NoteType | null, isEditing: boolean, headerRef: React.RefObject<InputRef | null>, editorRef: React.RefObject<EditorJS | null> }) => {
    const [heading, setHeading] = useState<string>(note?.title || "");
    const [isReadOnly, setIsReadOnly] = useState<boolean>(!isEditing);

    useEffect(() => {
        setIsReadOnly(!isEditing);
    }, [isEditing]);

    if (!note) {
        return null;
    }

    return (
        <div className="edit-note-component">
            <Input variant={"borderless"} value={heading} disabled={!isEditing} onChange={(e) => setHeading(e.target.value)} placeholder="Untitled Note" className="edit-note-component-header-input" ref={headerRef} />
            <div className="edit-note-component-content">
                <Editor
                    isReadOnly={isReadOnly}
                    editorReference={editorRef as React.RefObject<EditorJS>}
                    note={note}
                />
            </div>
        </div>
    )
}

export default EditNoteComponent;