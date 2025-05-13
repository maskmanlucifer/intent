/* eslint-disable no-undef */
async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({});
  const hasOffscreen = existingContexts.some(
    (c) => c.contextType === "OFFSCREEN_DOCUMENT",
  );

  if (!hasOffscreen) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play background music",
    });
  }
}

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get({ linkboard: 0 }, (data) => {
    const isSaved = Number(data.linkboard);
    if (isSaved) {
      chrome.storage.local.set({ linkboard: 0 });
    } else {
      chrome.storage.local.set({ linkboard: 1 });
    }

    if (!tab.url) {
      return;
    }

    const linkData = {
      id: Date.now().toString(),
      url: tab.url,
      createdAt: Date.now(),
      type: "webpage",
    };

    if (tab.url.includes("medium.com")) {
      linkData.imageUrl =
        "https://ik.imagekit.io/dnz8iqrsyc/1_jcY-BmXNNrWTJCOchzqJrQ.webp";
      putLinkDataToIDB(linkData);
      return;
    }

    putLinkDataToIDB(linkData);

    fetch(
      `https://og-fetcher.onrender.com/preview/?url=${encodeURIComponent(tab.url)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const { title, image } = data;
        const linkDataWithPreview = {
          ...linkData,
          title: title,
          imageUrl: image,
          type: "webpage",
        };
        putLinkDataToIDB(linkDataWithPreview);
      })
      .catch((error) => {
        console.error("Failed to fetch preview:", error);
      });
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-link",
    title: "Save Link in Intent",
    contexts: ["link"],
  });

  chrome.contextMenus.create({
    id: "save-image",
    title: "Save Image in Intent",
    contexts: ["image"],
  });
});

function getYouTubeThumbnailUrl(videoUrl) {
  const match = videoUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&]+)/,
  );
  const videoId = match?.[1];
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const url = info.linkUrl || info.srcUrl;

  if (!url) return;

  if (!url.startsWith("http")) {
    return;
  }

  const linkData = {
    id: Date.now().toString(),
    url: url,
    createdAt: Date.now(),
  };

  if (info.menuItemId === "save-link") {
    if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
      linkData.type = "video";
      linkData.imageUrl = getYouTubeThumbnailUrl(url);
    } else {
      linkData.type = "webpage";
    }
  }

  if (info.menuItemId === "save-image") {
    linkData.type = "image";
    linkData.imageUrl = url;
  }

  putLinkDataToIDB(linkData);

  chrome.storage.local.get({ linkboard: 0 }, (data) => {
    const isSaved = Number(data.linkboard);
    if (isSaved) {
      chrome.storage.local.set({ linkboard: 0 });
    } else {
      chrome.storage.local.set({ linkboard: 1 });
    }
  });

  if (linkData.type !== "webpage") {
    return;
  }

  if (url.includes("medium.com")) {
    linkData.imageUrl =
      "https://ik.imagekit.io/dnz8iqrsyc/1_jcY-BmXNNrWTJCOchzqJrQ.webp";
    putLinkDataToIDB(linkData);
    return;
  }

  fetch(
    `https://og-fetcher.onrender.com/preview/?url=${encodeURIComponent(url)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const { title, image } = data;
      const linkDataWithPreview = {
        ...linkData,
        title: title,
        imageUrl: image,
        type: "webpage",
      };
      putLinkDataToIDB(linkDataWithPreview);
    })
    .catch((error) => {
      console.error("Failed to fetch preview:", error);
    });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm && alarm.name === "genericAlarm") {
    chrome.storage.local.get("intentSettings", (data) => {
      if (data.intentSettings) {
        chrome.storage.local.set({
          intentSettings: {
            ...data.intentSettings,
            activePage: "Break",
            lastUpdatedAt: Date.now(),
          },
        });
      }
    });
  }
  if (alarm && alarm.name.startsWith("calendar-event#")) {
    const eventId = alarm.name.split("#")[1];
    chrome.storage.local.get("intentSettings", (data) => {
      if (data.intentSettings && data.intentSettings.sendEventReminder) {
        getDataFromIDB(eventId).then((event) => {
          if (event.start > Date.now()) {
            chrome.storage.local.set({
              event: { id: eventId, title: event.title, start: event.start },
            });
          }
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "PLAY_MUSIC") {
    await ensureOffscreenDocument();
    chrome.runtime.sendMessage({ action: "play", url: request.url });
    chrome.storage.local.get("intentSettings", (data) => {
      if (data.intentSettings) {
        chrome.storage.local.set({
          intentSettings: {
            ...data.intentSettings,
            isMusicPlaying: true,
            lastUpdatedAt: Date.now(),
          },
        });
      }
    });
  }

  if (request.action === "setAlarm") {
    const { delayInMinutes } = request;
    chrome.alarms.clear("genericAlarm", () => {
      chrome.alarms.create("genericAlarm", {
        delayInMinutes,
      });
    });
  }

  if (request.action === "PAUSE_MUSIC") {
    chrome.runtime.sendMessage({ action: "pause" });
    chrome.storage.local.get("intentSettings", (data) => {
      if (data.intentSettings) {
        chrome.storage.local.set({
          intentSettings: {
            ...data.intentSettings,
            isMusicPlaying: false,
            lastUpdatedAt: Date.now(),
          },
        });
      }
    });
  }

  sendResponse({ success: true });
});

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("intent", 2);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("calendarEvents")) {
        db.createObjectStore("calendarEvents", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("linkboard")) {
        db.createObjectStore("linkboard", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

const getDataFromIDB = async (eventId) => {
  const db = await openDB();
  const transaction = db.transaction("calendarEvents", "readonly");
  const store = transaction.objectStore("calendarEvents");
  return new Promise((resolve, reject) => {
    const request = store.get(eventId);
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

const putLinkDataToIDB = async (linkData) => {
  const db = await openDB();
  const transaction = db.transaction("linkboard", "readwrite");
  const store = transaction.objectStore("linkboard");
  return new Promise((resolve, reject) => {
    const request = store.put(linkData);
    request.onsuccess = (event) => {
      resolve(event.target.result);
      chrome.runtime.sendMessage({ type: "LINK_DATA_UPDATED" });
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};
