import React from "react";
import "./index.scss";
import { KEYBOARD_SHORTCUTS } from "../../constant";

const KeyboardShortcuts = () => {
  return (
    <div className="keyboard-shortcuts">
      <div className="description">
        You can use the follwing keyboard shortcuts to navigate the app and
        perform actions.
      </div>

      <div className="shortcut-list">
        {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
          <div className="shortcut-item" key={key}>
            <div className="keyboard-shortcut-description">{description}</div>
            <div className="keyboard-shortcut-key">{key}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
