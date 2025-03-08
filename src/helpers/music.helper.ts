import { setIsMusicPlaying } from "../redux/sessionSlice";
import { store } from "../redux/store";

export const handleMusicPlayingState = () => {
  chrome.storage.local.get("musicData").then((data) => {
    if(data.musicData) {
      store.dispatch(setIsMusicPlaying(data.musicData.tabId));
    } else {
      store.dispatch(setIsMusicPlaying("0"));
    }
  });
}