/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { PAGES } from "./constant";
import "./App.scss";
import { ConfigProvider, Drawer } from "antd";
import "./db";
import Todo from "./pages/todo";
import { useDispatch, useSelector } from "react-redux";
import { selectActivePage, setActivePage, selectSessionData, setSessionData, selectSettings } from "./redux/sessionSlice";
import Topbar from "./components/topbar";
import TimeBlock from "./components/todays-calendar";
import Break from "./pages/break";
import Note from "./pages/note";
import CustomAudioPlayer from "./components/custom-audio-player";

function App() {
  const dispatch = useDispatch();
  const activePage = useSelector(selectActivePage);
  const settings = useSelector(selectSettings);
  const sessionData  = useSelector(selectSessionData);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSidebarCollapsed = (isCollapsed: boolean) => {
    dispatch(setSessionData({
      ...sessionData,
      sidebarCollapsed: isCollapsed,
    }));
  }

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(["breakActive"]).then((result) => {
        if (result && result.breakActive) {
            dispatch(setActivePage(PAGES.BREAK));
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!chrome.storage) {
      return;
    }

    chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (
        changes.breakActive &&
        changes.breakActive.newValue !== changes.breakActive.oldValue
      ) {
        dispatch(setActivePage(changes.breakActive.newValue ? PAGES.BREAK : PAGES.TODO));
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener((changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (
          changes.breakActive &&
          changes.breakActive.newValue !== changes.breakActive.oldValue
        ) {
          dispatch(setActivePage(changes.breakActive.newValue ? PAGES.BREAK : PAGES.TODO));
        }
      });
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        token:  {
          controlHeight: 32,
          fontFamily: "Inter",
          colorPrimary: '#155dfc',
        },
      }}
    >
      <div className="App">
        {activePage !== PAGES.BREAK && <Topbar isSidebarCollapsed={sessionData.sidebarCollapsed} setSidebarCollapsed={handleSidebarCollapsed} setIsDrawerOpen={setIsDrawerOpen} isDrawerOpen={isDrawerOpen} showCollapsedIcon={activePage === PAGES.TODO} />}
        {activePage === PAGES.TODO && <Todo isSidebarCollapsed={sessionData.sidebarCollapsed} setIsSidebarCollapsed={handleSidebarCollapsed}/>}
        {activePage === PAGES.NOTES && <Note />}
        {activePage !== PAGES.BREAK && <Drawer closeIcon={false} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} placement="bottom" height={360} maskClosable={true} mask={true} title={<div className="drawer-title">TODAY'S CALENDAR</div>}>
          <TimeBlock />
        </Drawer>}
        {activePage === PAGES.BREAK && <Break />}
        {settings.showCustomAudioPlayer && <CustomAudioPlayer />}
      </div>
    </ConfigProvider>
  );
}

export default App;
