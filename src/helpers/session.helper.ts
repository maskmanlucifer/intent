import { syncSettings } from "../redux/sessionSlice";

export const fetchAndUpdateSession = () => {
  if (chrome.storage) {
    chrome.storage.local.get("intentSettings", (data) => {
      const sessionData = data.intentSettings || {};
      syncSettings(sessionData);
    });
  }
};
