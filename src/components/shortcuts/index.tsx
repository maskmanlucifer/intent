import React from "react";
import { useTranslation } from "react-i18next";
import "./index.scss";
import { KEYBOARD_SHORTCUTS } from "../../constant";

const KeyboardShortcuts = () => {
  const { t } = useTranslation();
  return (
    <div className="keyboard-shortcuts">
      {Object.entries(KEYBOARD_SHORTCUTS).map(
        ([key, { key: shortcutKey }]) => (
          <div key={key} className="shortcut-list">
            <div className="keyboard-shortcut-description">{t(`shortcuts.${key}`)}</div>
            <div className="keyboard-shortcut-key">{shortcutKey}</div>
          </div>
        ),
      )}
    </div>
  );
};

export default KeyboardShortcuts;
