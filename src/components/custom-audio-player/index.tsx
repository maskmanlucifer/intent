/* eslint-disable no-undef */
import { useRef, useEffect } from "react";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsMusicPlaying,
  selectMusicMode,
  selectTabId,
  setIsMusicPlaying,
  selectIsPlayingFromSameTab,
} from "../../redux/sessionSlice";
import classNames from "classnames";
import { RootState } from "../../redux/store";
import {
  PauseCircleTwoTone,
  PlayCircleTwoTone,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import { SONGS } from "../../constant";

const CustomAudioPlayer = () => {
  const isPlaying = useSelector((state: RootState) => selectIsMusicPlaying(state)) !== "0";
  const musicMode = useSelector((state: RootState) => selectMusicMode(state));
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const tabId = useSelector((state: RootState) => selectTabId(state));
  const dispatch = useDispatch();
  const isPlayingFromSameTab = useSelector(selectIsPlayingFromSameTab);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const audio = new Audio(SONGS[musicMode][0].src);
    audio.loop = true;
    audio.volume = 1;
    audioPlayerRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (!chrome.storage) {
      return;
    }

    chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }) => {
      if(changes.musicData && changes.musicData.newValue.tabId !== tabId) {
        if(changes.musicData.newValue.isMusicPlaying) {
          if(isPlaying) {
            audioPlayerRef.current?.pause();
          }
          dispatch(setIsMusicPlaying(changes.musicData.newValue.tabId));
        } else {
          if(isPlaying) {
            audioPlayerRef.current?.pause();
          }
          dispatch(setIsMusicPlaying("0"));
        }
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener((changes: { [key: string]: chrome.storage.StorageChange }) => {
        if(changes.musicData && changes.musicData.newValue.tabId !== tabId) {
          if(changes.musicData.newValue.isMusicPlaying) {
            dispatch(setIsMusicPlaying(changes.musicData.newValue.tabId));
          } else {
            dispatch(setIsMusicPlaying("0"));
          }
        }
      });
    };
  }, [isPlaying]);

  useEffect(() => {
    if(isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if(audioPlayerRef.current) {
      audioPlayerRef.current.src = SONGS[musicMode][0].src;
      audioPlayerRef.current.play();
    }

    if(chrome.storage) {
      chrome.storage.local.set({ musicData: {
        isMusicPlaying: true,
        tabId: tabId,
      }});
    }
  }, [musicMode]);

  useEffect(() => {
    const handleBeforeUnload = () => {

      console.log("isPlaying", isPlaying);
      console.log("isPlayingFromSameTab", isPlayingFromSameTab);

      if (isPlaying && isPlayingFromSameTab) {
        dispatch(setIsMusicPlaying("0"));
        if(chrome.storage) {
          chrome.storage.local.set({ musicData: {
            isMusicPlaying: false,
            tabId: tabId,
          }});
        }
      }
      return undefined;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    if (isPlaying && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      dispatch(setIsMusicPlaying("0"));
      if(chrome.storage) {
        chrome.storage.local.set({musicData: {
          isMusicPlaying: false,
          tabId: tabId,
        }});
      }
    } else if (audioPlayerRef.current) {
      audioPlayerRef.current.play();
      dispatch(setIsMusicPlaying(tabId));
      if(chrome.storage) {
        chrome.storage.local.set({ musicData: {
          isMusicPlaying: true,
          tabId: tabId,
        }});
      }
    }
  };

  const handlePlayPrev = () => {
    const prevIndex =
      (SONGS[musicMode][0].index - 1 + SONGS[musicMode].length) %
      SONGS[musicMode].length;

    if(audioPlayerRef.current) {
      audioPlayerRef.current.src = SONGS[musicMode][prevIndex].src;
      audioPlayerRef.current.play();
    }
    if(chrome.storage) {
      chrome.storage.local.set({ musicData: {
        isMusicPlaying: false,
        tabId: tabId,
      }});
    }
  };

  const handlePlayNext = () => {
    const nextIndex = (SONGS[musicMode][0].index + 1) % SONGS[musicMode].length;
    if(audioPlayerRef.current) {
      audioPlayerRef.current.src = SONGS[musicMode][nextIndex].src;
      audioPlayerRef.current.play();
    }
    if(chrome.storage) {
      chrome.storage.local.set({ musicData: {
        isMusicPlaying: false,
        tabId: tabId,
      }});
    }
  };

  return (
    <div className={classNames("custom-audio-player", { playing: isPlaying })}>
      <StepBackwardOutlined onClick={handlePlayPrev} />
      {isPlaying ? (
        <PauseCircleTwoTone onClick={togglePlayPause} />
      ) : (
        <PlayCircleTwoTone onClick={togglePlayPause} />
      )}
      <StepForwardOutlined onClick={handlePlayNext} />
    </div>
  );
};

export default CustomAudioPlayer;
