import React from "react";
import "./index.scss";
interface BreakPillProps {
  text: string;
  inlineStyle?: React.CSSProperties;
}

const BreakPill = ({
  text,
  inlineStyle = {
    top: 0,
    left: 0,
    background: "blue",
  },
}: BreakPillProps) => {
  return (
    <div className="break-pill" style={inlineStyle}>
      <div className="header">
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
