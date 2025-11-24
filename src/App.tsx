/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { KEYBOARD_SHORTCUTS, PAGES } from "./constant";
import { theme as antdTheme } from 'antd';
import "./App.scss";
import { ConfigProvider } from "antd";
import "./db";
import Todo from "./pages/todo";
import { useSelector } from "react-redux";
import {
  selectActivePage,
  selectIsSidebarCollapsed,
  syncSettings,
} from "./redux/sessionSlice";
import Topbar from "./components/topbar";
import SmoothSidebar from "./components/smooth-sidebar";
import LoadingScreen from "./components/loading-screen";
import Mousetrap from "mousetrap";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";

// Lazy load the Linkboard component
const Linkboard = lazy(() => import("./components/linkboard"));

const AppContent = () => {
  const { t } = useTranslation();
  const activePage = useSelector(selectActivePage);
  const [isLinkBoardOpen, setIsLinkBoardOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const isSidebarCollapsed = useSelector(selectIsSidebarCollapsed);
  const { theme } = useTheme();

  // Prevent flash during hydration and show loading screen
  useEffect(() => {
    setIsHydrated(true);

    // Show minimal loading screen for smooth fog-clearing effect
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 800); // 0.8 seconds for minimal, smooth experience

    return () => clearTimeout(timer);
  }, []);

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

  // Show loading screen during hydration to prevent flash
  if (!isHydrated || showLoadingScreen) {
    return <LoadingScreen isVisible={true} theme={theme} />;
  }

  return (
    <>
      <LoadingScreen isVisible={showLoadingScreen} theme={theme} />
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
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
        <div className={`App ${showLoadingScreen ? 'loading' : 'loaded'}`}>
          <Topbar
            isSidebarCollapsed={isSidebarCollapsed}
            setSidebarCollapsed={handleSidebarCollapsed}
            showCollapsedIcon={activePage === PAGES.TODO}
            setIsLinkBoardOpen={setIsLinkBoardOpen}
            isLinkBoardOpen={isLinkBoardOpen}
          />
          <Todo
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={handleSidebarCollapsed}
          />
          <SmoothSidebar
            isOpen={isLinkBoardOpen}
            onClose={() => setIsLinkBoardOpen(false)}
            title={t('app.linkboard').toUpperCase()}
          >
            <Suspense fallback={
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                color: 'var(--text-secondary)'
              }}>
                Loading Linkboard...
              </div>
            }>
              <Linkboard />
            </Suspense>
          </SmoothSidebar>
        </div>
      </ConfigProvider>
    </>
  );
};

function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Wait for i18next to be ready
    if (i18n.isInitialized) {
      setI18nReady(true);
    } else {
      i18n.on('initialized', () => {
        setI18nReady(true);
      });
    }
  }, []);

  // Get theme from document attribute (set by theme-init.js) for loading screen
  const getInitialTheme = (): 'light' | 'dark' => {
    const themeAttr = document.documentElement.getAttribute('data-theme');
    if (themeAttr === 'dark' || themeAttr === 'light') {
      return themeAttr;
    }
    return 'light';
  };

  // Show loading screen while i18next is initializing
  if (!i18nReady) {
    return (
      <ThemeProvider>
        <LoadingScreen isVisible={true} theme={getInitialTheme()} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
