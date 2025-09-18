import React from "react";
import "./index.scss";
import { KEYBOARD_SHORTCUTS } from "../../constant";

const KeyboardShortcuts = () => {
  return (
    <div className="keyboard-shortcuts">
      {Object.entries(KEYBOARD_SHORTCUTS).map(
        ([key, { key: shortcutKey, description }]) => (
          <div key={key} className="shortcut-list">
            <div className="keyboard-shortcut-description">{description}</div>
            <div className="keyboard-shortcut-key">{shortcutKey}</div>
          </div>
        )
      )}
    </div>
  );
};

export default KeyboardShortcuts;
