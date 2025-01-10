import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Paragraph from "@editorjs/paragraph";
import EditorjsList from "@editorjs/list";
import Header from "@editorjs/header";
import CodeTool from "@editorjs/code";
import LinkTool from '@editorjs/link';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import "./index.scss";

const Editor = ({ isEditing, editorReference, note }) => {
  const editorRef = useRef();

  useEffect(() => {
    if(editorRef.current) {
      return;
    }

    const editor = new EditorJS({
      holder: "editorjs",
      tools: {
        paragraph: {
          class: Paragraph,
          tunes: []
        },
        list: {
          class: EditorjsList,
          config: {
            defaultStyle: "unordered",
          },
          tunes: []
        },
        header: {
          class: Header,
          config: {
            placeholder: "Enter a header",
            levels: [3],
            defaultLevel: 3,
          },
          tunes: [],
        },
        code: CodeTool,
        linkTool: LinkTool,
        delimiter: Delimiter,
        inlineCode: InlineCode,
      },
      placeholder: "Let's write an awesome note!",
      readOnly: !isEditing,
      data: JSON.parse(note?.data || "{}"),
      onReady: () => {
      }
    });

    editorRef.current = editor;
    editorReference.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, [note, isEditing]);

  return <div id="editorjs"></div>;
};

export default Editor;
