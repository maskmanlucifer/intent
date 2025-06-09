/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { KEYBOARD_SHORTCUTS, PAGES } from "./constant";
import "./App.scss";
import { Button, ConfigProvider, Drawer } from "antd";
import "./db";
import Todo from "./pages/todo";
import { useSelector } from "react-redux";
import {
  selectActivePage,
  selectIsSidebarCollapsed,
  selectSettings,
  syncSettings,
} from "./redux/sessionSlice";
import Topbar from "./components/topbar";
import TimeBlock from "./components/todays-calendar";
import Break from "./pages/break";
import CustomAudioPlayer from "./components/custom-audio-player";
import SettingsModal from "./components/settings-modal";
import Linkboard from "./components/linkboard";
import { CloseOutlined, MehOutlined } from "@ant-design/icons";
import { ReactComponent as CloseIcon } from "./assets/icons/close.svg";
import Mousetrap from "mousetrap";
import ReminderNotifications from "./components/reminder-notifications";
import FeatureIntroModal from "./components/feature-intro";

function App() {
  const activePage = useSelector(selectActivePage);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLinkBoardOpen, setIsLinkBoardOpen] = useState(false);
  const settings = useSelector(selectSettings);
  const isSidebarCollapsed = useSelector(selectIsSidebarCollapsed);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);
  const [isFeatureIntroModalOpen, setIsFeatureIntroModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      handleSidebarCollapsed(!isSidebarCollapsed);
    };

    Mousetrap.bind(KEYBOARD_SHORTCUTS.toggleSidebar.binding, handler);

    return () => {
      Mousetrap.unbind(KEYBOARD_SHORTCUTS.toggleSidebar.binding);
    };
  }, [isSidebarCollapsed]);

  const handleSidebarCollapsed = (isCollapsed: boolean) => {
    syncSettings({
      sidebarCollapsed: isCollapsed,
    });
  };

  useEffect(() => {
    if (settings.isFeatureIntroSeen) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!settings.isFeatureIntroSeen) {
        setIsFeatureIntroModalOpen(true);
        syncSettings({
          isFeatureIntroSeen: true,
        });
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [settings.isFeatureIntroSeen]);

  return (
    <ConfigProvider
      theme={{
        token: {
          controlHeight: 32,
          fontFamily: "Inter",
          colorPrimary: "#155dfc",
        },
        components: {
          Select: {
            optionPadding: "0px 12px 0px 12px",
            optionHeight: 24,
          },
        },
      }}
    >
      <div className="App">
        {activePage === PAGES.TODO && <ReminderNotifications />}
        {activePage !== PAGES.BREAK && (
          <Topbar
            isSidebarCollapsed={isSidebarCollapsed}
            setSidebarCollapsed={handleSidebarCollapsed}
            setIsDrawerOpen={setIsDrawerOpen}
            isDrawerOpen={isDrawerOpen}
            showCollapsedIcon={activePage === PAGES.TODO}
            setIsLinkBoardOpen={setIsLinkBoardOpen}
            isLinkBoardOpen={isLinkBoardOpen}
          />
        )}
        {activePage === PAGES.TODO && (
          <Todo
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={handleSidebarCollapsed}
          />
        )}
        {activePage !== PAGES.BREAK && (
          <Drawer
            closeIcon={true}
            open={isLinkBoardOpen}
            onClose={() => setIsLinkBoardOpen(false)}
            placement="right"
            className="linkboard-drawer"
            width={400}
            maskClosable={true}
            mask={true}
            title={
              <div
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  fontFamily: "var(--secondary-font)",
                  fontSize: "20px",
                }}
              >
                {" "}
                <Button
                  icon={<MehOutlined />}
                  type="link"
                  className="watch-demo-btn"
                  onClick={() => {
                    setIsWhatsNewModalOpen(true);
                    setIsLinkBoardOpen(false);
                  }}
                >
                  Watch demo
                </Button>
                LINKBOARD{" "}
              </div>
            }
          >
            <Linkboard />
          </Drawer>
        )}
        {activePage === PAGES.BREAK && <Break />}
        {settings.showCustomAudioPlayer && <CustomAudioPlayer />}
        <SettingsModal
          visible={isSettingsModalOpen}
          onClose={() => {
            setIsSettingsModalOpen(false);
            setIsDrawerOpen(false);
          }}
          tab="calendar"
        />
        {activePage !== PAGES.BREAK && (
          <Drawer
            closeIcon={false}
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            placement="bottom"
            maskClosable={true}
            height={360}
            mask={true}
            title={
              <div className="drawer-title">
                TODAY'S CALENDAR{" "}
                {!settings.icalUrl && (
                  <Button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="import-calendar-btn"
                    type="primary"
                    size="small"
                  >
                    Import calendar
                  </Button>
                )}
                <Button
                  icon={<CloseOutlined />}
                  type="default"
                  onClick={() => setIsDrawerOpen(false)}
                  size="small"
                  style={{ marginLeft: !settings.icalUrl ? "8px" : "auto" }}
                />
              </div>
            }
          >
            <TimeBlock />
          </Drawer>
        )}
        {isWhatsNewModalOpen && (
          <div className="iframe-container">
            <div className="iframe-header">
              <span>LINKBOARD</span>
              <div className="close-icon">
                <CloseIcon onClick={() => setIsWhatsNewModalOpen(false)} />
              </div>
            </div>
            <video width="1200" height="560" controls>
              <source
                src="https://ik.imagekit.io/dnz8iqrsyc/linkboard-intro.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        <FeatureIntroModal visible={isFeatureIntroModalOpen} onClose={() => {
          setIsFeatureIntroModalOpen(false);
        }} />
      </div>
    </ConfigProvider>
  );
}

export default App;
