import { updateSettings } from "../redux/sessionSlice";
import { store } from "../redux/store";

export const fetchAndUpdateSession = () => {
    if(chrome.storage) {
        chrome.storage.local.get('intentSettings', (data) => {
            const sessionData = data.intentSettings || {};
            store.dispatch(updateSettings(sessionData));
        });
    }
}   