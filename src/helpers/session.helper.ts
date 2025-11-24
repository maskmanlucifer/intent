import { syncSettings } from "../redux/sessionSlice";

export const fetchAndUpdateSession = () => {
  if (chrome.storage) {
    chrome.storage.local.get("intentSettings", (data) => {
      const sessionData = data.intentSettings || {};
      syncSettings(sessionData);
    });
  }
};


export const getUniqueUserId = async () => {
  try {
    const { uniqueUserId } = await chrome.storage.local.get("uniqueUserId");

    if (uniqueUserId) {
      return uniqueUserId;
    }

    const newId = crypto.randomUUID();
    await chrome.storage.local.set({ uniqueUserId: newId });

    return newId;
  } catch {
    return crypto.randomUUID();
  }
};