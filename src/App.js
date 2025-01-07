/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { PAGES } from "./constant";
import PageSwitcher from "./components/page-switcher";
import "./App.scss";
import Todo from "./pages/todo";
import InfoDropdown from "./components/info-dropdown";
import { ConfigProvider } from "antd";
import Break from "./pages/break";
import { rehydrateStore } from "./redux/store";

function App() {
  const [activePage, setActivePage] = useState(PAGES.TODO);

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(["breakActive"]).then((result) => {
        if (result && result.breakActive) {
          setActivePage(PAGES.BREAK);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!chrome.storage) {
      return;
    }
    const handleStorageChange = (changes) => {
      if (
        changes.breakActive &&
        changes.breakActive.newValue !== changes.breakActive.oldValue
      ) {
        setActivePage(changes.breakActive.newValue ? PAGES.BREAK : PAGES.TODO);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        rehydrateStore();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          controlHeight: 32, // Sets the global button height
          fontFamily: "Roboto",
        },
      }}
    >
      <div className="App">
        {activePage === PAGES.TODO && (
          <PageSwitcher page={activePage} setPage={setActivePage} />
        )}
        {activePage === PAGES.TODO && <Todo />}
        {activePage === PAGES.TODO && <InfoDropdown />}
        {activePage === PAGES.BREAK && <Break />}
      </div>
    </ConfigProvider>
  );
}

export default App;
