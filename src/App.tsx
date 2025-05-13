/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { PAGES } from "./constant";
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
import { MehOutlined } from "@ant-design/icons";
import { ReactComponent as CloseIcon } from "./assets/icons/close.svg";
import Mousetrap from "mousetrap";

function App() {
  const activePage = useSelector(selectActivePage);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLinkBoardOpen, setIsLinkBoardOpen] = useState(false);
  const settings = useSelector(selectSettings);
  const isSidebarCollapsed = useSelector(selectIsSidebarCollapsed);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      handleSidebarCollapsed(!isSidebarCollapsed);
    };

    Mousetrap.bind("e", handler);

    return () => {
      Mousetrap.unbind("e");
    };
  }, [isSidebarCollapsed]);

  const handleSidebarCollapsed = (isCollapsed: boolean) => {
    syncSettings({
      sidebarCollapsed: isCollapsed,
    });
  };

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
              </div>
            }
          >
            <TimeBlock />
          </Drawer>
        )}
        {isWhatsNewModalOpen && (
          <div className="iframe-container">
            <div className="iframe-header">
              <span>Whats new?</span>
              <div className="close-icon">
                <CloseIcon onClick={() => setIsWhatsNewModalOpen(false)} />
              </div>
            </div>
            <iframe
              width="100%"
              height="94%"
              style={{ borderRadius: "4px" }}
              id="iframe-feature"
              src="https://www.youtube.com/embed/K0KMvgEHVH8?si=v-ZjJ79wn_MD6AFs"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
