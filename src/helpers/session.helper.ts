import { getItem } from "../db/localStorage";
import { store } from "../redux/store";
import { setSettings, setSessionData } from "../redux/sessionSlice";
    import { TSettings, TSessionData } from "../types";

export const fetchAndUpdateSession = () => {
    let settings = getItem('settings') as TSettings || {};
    store.dispatch(setSettings(settings));

    const sessionData = getItem('sessionData') as TSessionData || {};
    store.dispatch(setSessionData(sessionData));
}   