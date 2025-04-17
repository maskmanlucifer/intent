/* eslint-disable no-undef */
import { useState } from "react";
import { PAGES } from "./constant";
import "./App.scss";
import { Button, ConfigProvider, Drawer } from "antd";
import "./db";
import Todo from "./pages/todo";
import { useSelector } from "react-redux";
import { selectActivePage, selectIsSidebarCollapsed, selectSettings, syncSettings } from "./redux/sessionSlice";
import Topbar from "./components/topbar";
import TimeBlock from "./components/todays-calendar";
import Break from "./pages/break";
import Note from "./pages/note";
import CustomAudioPlayer from "./components/custom-audio-player";
import SettingsModal from "./components/settings-modal";

function App() {
  const activePage = useSelector(selectActivePage);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const settings = useSelector(selectSettings);
  const isSidebarCollapsed = useSelector(selectIsSidebarCollapsed)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleSidebarCollapsed = (isCollapsed: boolean) => {
    syncSettings({
      sidebarCollapsed: isCollapsed
    });
  }

  return (
    <ConfigProvider
      theme={{
        token:  {
          controlHeight: 32,
          fontFamily: "Inter",
          colorPrimary: '#155dfc',
        },
        components: {
          Select: {
            optionPadding: '0px 12px 0px 12px',
            optionHeight: 24,
          },
        }
      }}
    >
      <div className="App">
        {activePage !== PAGES.BREAK && <Topbar isSidebarCollapsed={isSidebarCollapsed} setSidebarCollapsed={handleSidebarCollapsed} setIsDrawerOpen={setIsDrawerOpen} isDrawerOpen={isDrawerOpen} showCollapsedIcon={activePage === PAGES.TODO} />}
        {activePage === PAGES.TODO && <Todo isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={handleSidebarCollapsed}/>}
        {activePage === PAGES.NOTES && <Note />}
        {activePage !== PAGES.BREAK && 
        <Drawer closeIcon={false} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} placement="bottom" height={360} maskClosable={true} mask={true} title={<div className="drawer-title">TODAY'S CALENDAR {!settings.icalUrl && <Button onClick={() => setIsSettingsModalOpen(true)} className="import-calendar-btn" type="primary" size="small">Import calendar</Button>}</div>}>
          <TimeBlock />
        </Drawer>}
        {activePage === PAGES.BREAK && <Break />}
        {settings.showCustomAudioPlayer && <CustomAudioPlayer />}
        <SettingsModal
        visible={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false)
          setIsDrawerOpen(false);
        }}
        tab="calendar"
      />
      </div>
    </ConfigProvider>
  );
}

export default App;
