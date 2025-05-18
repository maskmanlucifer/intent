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
import { useEffect } from "react";
import Mousetrap from "mousetrap";
import { KEYBOARD_SHORTCUTS } from "../../constant";

const CustomAudioPlayer = () => {
  const { isMusicPlaying } = useSelector(selectSettings);

  const musicMode = useSelector(selectMusicMode);

  const togglePlayPause = () => {
    chrome.runtime.sendMessage({
      action: isMusicPlaying ? "PAUSE_MUSIC" : "PLAY_MUSIC",
      mode: musicMode,
    });
  };

  useEffect(() => {
    Mousetrap.bind(KEYBOARD_SHORTCUTS.music.binding, togglePlayPause);

    return () => {
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.music.binding);
    };
  }, [isMusicPlaying, musicMode]);

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
            className={classNames("cd-icon", {
              playing: isMusicPlaying,
            })}
          />
          <img
            src="https://ik.imagekit.io/dnz8iqrsyc/music.gif"
            alt="notes"
            className={classNames("music-notes cd-icon", {
              playing: isMusicPlaying,
            })}
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
