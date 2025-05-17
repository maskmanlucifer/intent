import React from "react";
import "./index.scss";
import Checkbox from "antd/es/checkbox/Checkbox";
interface BreakPillProps {
  text: string;
  inlineStyle?: React.CSSProperties;
}

const BreakPill = ({
  text,
  inlineStyle = {
    background: "blue",
  },
}: BreakPillProps) => {
  return (
    <div className="break-pill" style={inlineStyle}>
      <div className="header">
        <Checkbox className="checkbox" />
        {text === "Do nothing" && <span>💆‍♂️</span>}
        {text === "Take a walk" && <span>🚶‍♂️</span>}
        {text === "Drink some water" && <span>🥤</span>}
        {text === "Have a snack" && <span>🍫</span>}
        <span>{text}</span>
      </div>
    </div>
  );
};

export default BreakPill;
