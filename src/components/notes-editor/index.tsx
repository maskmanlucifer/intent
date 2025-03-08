import { useEffect, useRef } from "react";
import EditorJS, { BlockToolConstructable } from "@editorjs/editorjs";
import Paragraph from "@editorjs/paragraph";
import EditorjsList from "@editorjs/list";
import Header from "@editorjs/header";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import "./index.scss";
import { Note as NoteType } from "../../types";

interface EditorProps {
  isReadOnly: boolean;
  editorReference: React.RefObject<EditorJS>;
  note: NoteType;
}

const Editor = ({ isReadOnly, editorReference, note }: EditorProps) => {
  const editorRef = useRef<EditorJS | null>(null);
  const previousReadOnly = useRef<boolean>(isReadOnly);

  useEffect(() => {
    if (editorRef.current && previousReadOnly.current === isReadOnly) {
      return;
    }

    if(previousReadOnly.current !== isReadOnly) {
      editorRef.current?.destroy();
    }

    const editor = new EditorJS({
      holder: "editorjs",
      tools: {
        paragraph: {
          class: Paragraph as unknown as BlockToolConstructable,
          tunes: [],
        },
        list: {
          class: EditorjsList as unknown as BlockToolConstructable,
          config: {
            defaultStyle: "unordered",
          },
          tunes: [],
        },
        header: {
          class: Header as unknown as BlockToolConstructable,
          config: {
            placeholder: "Enter a header",
            levels: [3],
            defaultLevel: 3,
          },
          tunes: [],
        },
        delimiter: Delimiter,
        inlineCode: InlineCode,
      },
      placeholder: "Use '/' to choose element blocks",
      readOnly: isReadOnly,
      data: JSON.parse(note.content || "{}"),
      onReady: () => {},
    });

    editorRef.current = editor;
    editorReference.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, [note, isReadOnly]);

  return <div id="editorjsWrapper"><div id="editorjs"></div></div>
  
};

export default Editor;
