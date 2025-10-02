/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { KEYBOARD_SHORTCUTS, PAGES } from "./constant";
import "./App.scss";
import { Button, ConfigProvider, Drawer, Modal } from "antd";
import "./db";
import Todo from "./pages/todo";
import { useSelector } from "react-redux";
import {
  selectActivePage,
  selectIsSidebarCollapsed,
  syncSettings,
} from "./redux/sessionSlice";
import Topbar from "./components/topbar";
import Linkboard from "./components/linkboard";
import { MehOutlined } from "@ant-design/icons";
import { ReactComponent as CloseIcon } from "./assets/icons/close.svg";
import Mousetrap from "mousetrap";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

const AppContent = () => {
  const activePage = useSelector(selectActivePage);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLinkBoardOpen, setIsLinkBoardOpen] = useState(false);
  const isSidebarCollapsed = useSelector(selectIsSidebarCollapsed);
  const { theme } = useTheme();
  const [isWhatsNewModalData, setIsWhatsNewModalData] = useState({
    isOpen: false,
    feature: "linkboard",
    title: "Linkboard",
    media: "https://ik.imagekit.io/dnz8iqrsyc/linkboard-intro.mp4",
  });

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

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? require('antd').theme.darkAlgorithm : require('antd').theme.defaultAlgorithm,
        token: {
          controlHeight: 32,
          fontFamily: "Inter",
          colorPrimary: theme === 'dark' ? "#3b82f6" : "#155dfc",
          colorBgContainer: theme === 'dark' ? "#111111" : "#ffffff",
          colorBgElevated: theme === 'dark' ? "#1a1a1a" : "#ffffff",
          colorBgLayout: theme === 'dark' ? "#0a0a0a" : "#f5f5f5",
          colorBorder: theme === 'dark' ? "#27272a" : "#d9d9d9",
          colorText: theme === 'dark' ? "#f8fafc" : "#1a1a1a",
          colorTextSecondary: theme === 'dark' ? "#cbd5e1" : "#666666",
          colorTextTertiary: theme === 'dark' ? "#94a3b8" : "#999999",
        },
        components: {
          Select: {
            optionPadding: "0px 12px 0px 12px",
            optionHeight: 24,
          },
          Modal: {
            contentBg: theme === 'dark' ? "#111111" : "#ffffff",
            headerBg: theme === 'dark' ? "#111111" : "#ffffff",
          },
          Drawer: {
            colorBgElevated: theme === 'dark' ? "#111111" : "#ffffff",
          },
        },
      }}
    >
        <div className="App">
        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          setSidebarCollapsed={handleSidebarCollapsed}
          setIsDrawerOpen={setIsDrawerOpen}
          isDrawerOpen={isDrawerOpen}
          showCollapsedIcon={activePage === PAGES.TODO}
          setIsLinkBoardOpen={setIsLinkBoardOpen}
          isLinkBoardOpen={isLinkBoardOpen}
        />
        <Todo
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={handleSidebarCollapsed}
          setIsWhatsNewModalData={setIsWhatsNewModalData}
        />
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
                  setIsWhatsNewModalData({
                    isOpen: true,
                    feature: "linkboard",
                    title: "LINKBOARD",
                    media:
                      "https://ik.imagekit.io/dnz8iqrsyc/linkboard-intro.mp4",
                  });
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
        <Modal
          open={isWhatsNewModalData.isOpen}
          onCancel={() =>
            setIsWhatsNewModalData({
              isOpen: false,
              feature: "",
              title: "",
              media: "",
            })
          }
          footer={null}
          style={{ maxWidth: '1240px' }}
          width={'80vw'}
          closeIcon={null}
          title={
            <div className="iframe-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{isWhatsNewModalData.title}</span>
              <div className="close-icon" style={{ cursor: "pointer" }}>
                <CloseIcon
                  onClick={() =>
                    setIsWhatsNewModalData({
                      isOpen: false,
                      feature: "",
                      title: "",
                      media: "",
                    })
                  }
                />
              </div>
            </div>
          }
          centered
          destroyOnClose
        >
          <div className="iframe-container" style={{ display: "flex", justifyContent: "center" }}>
            <video width="100%" height="100%" controls>
              <source src={isWhatsNewModalData.media} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </Modal>
        </div>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
