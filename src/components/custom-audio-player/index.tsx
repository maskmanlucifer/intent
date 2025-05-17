/* eslint-disable no-undef */
import "./index.scss";
import { useSelector } from "react-redux";
import { selectMusicMode, selectSettings } from "../../redux/sessionSlice";
import classNames from "classnames";

import {
  PauseCircleTwoTone,
  PlayCircleTwoTone,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";

const CustomAudioPlayer = () => {
  const { isMusicPlaying } = useSelector(selectSettings);

  const musicMode = useSelector(selectMusicMode);

  const togglePlayPause = () => {
    chrome.runtime.sendMessage({
      action: isMusicPlaying ? "PAUSE_MUSIC" : "PLAY_MUSIC",
      mode: musicMode,
    });
  };

  const handlePlayPrev = () => {
    if (isMusicPlaying && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: "PLAY_MUSIC",
        mode: musicMode,
        prev: true,
      });
    }
  };

  const handlePlayNext = () => {
    if (isMusicPlaying && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: "PLAY_MUSIC",
        mode: musicMode,
        next: true,
      });
    }
  };

  return (
    <>
      {isMusicPlaying && (
        <>
          <img
            src="https://ik.imagekit.io/dnz8iqrsyc/cd.png"
            alt="cd"
            className="cd-icon"
          />
          <img
            src="https://ik.imagekit.io/dnz8iqrsyc/music.gif"
            alt="notes"
            className="music-notes cd-icon"
          />
        </>
      )}
      <div
        className={classNames("custom-audio-player", {
          playing: isMusicPlaying,
        })}
      >
        <StepBackwardOutlined onClick={handlePlayPrev} />
        {isMusicPlaying ? (
          <PauseCircleTwoTone
            onClick={togglePlayPause}
            className="pause-circle"
          />
        ) : (
          <PlayCircleTwoTone onClick={togglePlayPause} />
        )}
        <StepForwardOutlined onClick={handlePlayNext} />
      </div>
    </>
  );
};

export default CustomAudioPlayer;
