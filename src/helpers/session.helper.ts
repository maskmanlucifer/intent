import { getItem } from "../db/localStorage";
import { store } from "../redux/store";
import { setSettings, setSessionData } from "../redux/sessionSlice";
    import { TSettings, TSessionData } from "../types";

export const fetchAndUpdateSession = () => {
    let settings = getItem('settings') as TSettings || {};
    const defaultSettings = {
        icalUrl: '',
        workingHours: ['09:00', '17:00'],
        breakInterval: 90,
        sidebarCollapsed: false,
    }
    
    store.dispatch(setSettings(settings || defaultSettings));

    const sessionData = getItem('sessionData') as TSessionData || {};
    store.dispatch(setSessionData(sessionData));
}   