/* eslint-disable no-undef */
import "./index.scss";
import { useSelector } from "react-redux";
import { selectMusicMode, selectSettings, syncSettings } from "../../redux/sessionSlice";
import classNames from "classnames";

import {
  PauseCircleTwoTone,
  PlayCircleTwoTone,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";

import { SONGS } from "../../constant";

const CustomAudioPlayer = () => {
  const { isMusicPlaying, songIndex } = useSelector(selectSettings);

  const musicMode = useSelector(selectMusicMode);

  const togglePlayPause = () => {
    chrome.runtime.sendMessage({
      action: isMusicPlaying ? "PAUSE_MUSIC" : "PLAY_MUSIC",
      url: !isMusicPlaying ? SONGS[musicMode][0].src : undefined,
    });
  };

  const handlePlayPrev = () => {
    const songsLength = SONGS[musicMode].length;
    const newSongIndex = (songIndex - 1 + songsLength) % songsLength;
    const songSrc = SONGS[musicMode][newSongIndex].src;

    if (isMusicPlaying && chrome.runtime) {
      chrome.runtime.sendMessage({ action: "PLAY_MUSIC", url: songSrc });
      syncSettings({ songIndex: newSongIndex });
    }
  };

  const handlePlayNext = () => {
    const songsLength = SONGS[musicMode].length;
    const newSongIndex = (songIndex + 1) % songsLength;
    const songSrc = SONGS[musicMode][newSongIndex].src;

    if (isMusicPlaying && chrome.runtime) {
      chrome.runtime.sendMessage({ action: "PLAY_MUSIC", url: songSrc });
      syncSettings({ songIndex: newSongIndex });
    }
  };

  return (
    <div
      className={classNames("custom-audio-player", { playing: isMusicPlaying })}
    >
      <StepBackwardOutlined onClick={handlePlayPrev} />

      {isMusicPlaying ? (
        <PauseCircleTwoTone onClick={togglePlayPause} />
      ) : (
        <PlayCircleTwoTone onClick={togglePlayPause} />
      )}

      <StepForwardOutlined onClick={handlePlayNext} />
    </div>
  );
};

export default CustomAudioPlayer;
