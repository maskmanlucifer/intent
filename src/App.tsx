/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { PAGES } from "./constant";
import "./App.scss";
import { ConfigProvider, Drawer, Empty } from "antd";
import "./db";
import Todo from "./pages/todo";
import { useDispatch, useSelector } from "react-redux";
import { selectActivePage, setActivePage, selectSessionData, setSessionData } from "./redux/sessionSlice";
import Topbar from "./components/topbar";
import TimeBlock from "./components/todays-calendar";
import { ReactComponent as EmptyNotesIcon } from "./assets/images/empty-notes.svg";
import Break from "./pages/break";

function App() {
  const dispatch = useDispatch();
  const activePage = useSelector(selectActivePage);
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
        },
      }}
    >
      <div className="App">
        {activePage !== PAGES.BREAK && <Topbar isSidebarCollapsed={sessionData.sidebarCollapsed} setSidebarCollapsed={handleSidebarCollapsed} setIsDrawerOpen={setIsDrawerOpen} isDrawerOpen={isDrawerOpen} showCollapsedIcon={activePage === PAGES.TODO} />}
        {activePage === PAGES.TODO && <Todo isSidebarCollapsed={sessionData.sidebarCollapsed} setIsSidebarCollapsed={handleSidebarCollapsed}/>}
        {activePage === PAGES.NOTES && (
            <div className="notes-container">
                <Empty description="Noted feature is work in progress, please check back later" image={<EmptyNotesIcon />} />
          </div>
        )}
        {activePage !== PAGES.BREAK && <Drawer closeIcon={false} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} placement="bottom" height={360} maskClosable={true} mask={true} title={<div className="drawer-title">TODAY'S CALENDAR</div>}>
          <TimeBlock />
        </Drawer>}
        {activePage === PAGES.BREAK && <Break />}
      </div>
    </ConfigProvider>
  );
}

export default App;
