import React from "react";
import "./index.scss";
import {ReactComponent as WalkIcon} from "../../assets/icons/walk.svg";
import {ReactComponent as RestIcon} from "../../assets/icons/nothing.svg";
import {ReactComponent as MusicIcon} from "../../assets/icons/play-music.svg";
import {ReactComponent as SnackIcon} from "../../assets/icons/snack.svg";
import {ReactComponent as WaterIcon} from "../../assets/icons/water.svg";


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
      <div className="header"><svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z"
          fill="currentColor"
        />
      </svg>
      <span>{text}</span></div>
      {text === "Do nothing" && <RestIcon />}
      {text === "Take a walk" && <WalkIcon />}
      {text === "Drink some water" && <WaterIcon />}
      {text === "Play some music" && <MusicIcon />}
      {text === "Have a snack" && <SnackIcon />}
    </div>
  );
};

export default BreakPill;
