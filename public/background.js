/* eslint-disable no-undef */
let currentSongIndex = 0;

const SONGS = {
  JAZZ: [
    {
      title: "1st",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524663/jazz_3_adiz8p.mp3",
      index: 0,
    },
    {
      title: "2nd",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524651/jazz_1_clrjdy.mp3",
      index: 1,
    },
    {
      title: "3rd",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524622/jazz_2_tbjix0.mp3",
      index: 2,
    },
  ],
  NATURE: [
    {
      title: "1st",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524627/nature_4_tvqqxw.mp3",
      index: 0,
    },
    {
      title: "3rd",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524630/nature_3_bihpq4.mp3",
      index: 1,
    },
    {
      title: "4th",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524634/nature_5_ycsdcv.m4a",
      index: 2,
    },
    {
      title: "5th",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524623/nature_1_dimvbo.mp3",
      index: 3,
    },
    {
      title: "6th",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524622/nature_2_iywern.mp3",
      index: 4,
    },
  ],
  LO_FI: [
    {
      title: "1st",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524572/lo_fi_4_vvrkoh.mp3",
      index: 0,
    },
    {
      title: "2nd",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524574/lo_fi_1_hzenyj.mp3",
      index: 1,
    },
    {
      title: "3rd",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524580/lo_fi_8_otxntl.mp3",
      index: 2,
    },
    {
      title: "4th",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524581/lo_fi_7_bphfet.mp3",
      index: 3,
    },
    {
      title: "6th",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524582/lo_fi_2_vw6duv.mp3",
      index: 5,
    },
    {
      title: "7th",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524582/lo_fi_6_tamhgb.mp3",
      index: 6,
    },
    {
      title: "8th",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524614/lo_fi_5_hipdag.mp3",
      index: 7,
    },
    {
      title: "9th",
      src: "https://res.cloudinary.com/da3skwxam/video/upload/v1747524571/lo_fi_3_lzzhi3.mp3",
      index: 8,
    },
  ],
};

chrome.windows.onRemoved.addListener(() => {
  chrome.windows.getAll({}, (windows) => {
    if (windows.length === 0) {
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
  });
});

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
      if (data.intentSettings && data.intentSettings.sendBreakReminder) {
        chrome.storage.local.set({
          intentSettings: {
            ...data.intentSettings,
            activePage: "Break",
            lastUpdatedAt: Date.now(),
          },
        });

        chrome.alarms.clear("resetBreakAlarm", () => {
          chrome.alarms.create("resetBreakAlarm", {
            delayInMinutes: 180,
          });
        });
      }

      chrome.alarms.clear("resetBreakAlarm");
    });
  }

  if (alarm && alarm.name === "resetBreakAlarm") {
    chrome.alarms.clear("resetBreakAlarm");
    chrome.storage.local.get("intentSettings", (data) => {
      if (data.intentSettings) {
        chrome.storage.local.set({
          intentSettings: {
            ...data.intentSettings,
            activePage: "Todo",
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

    if (request.prev) {
      currentSongIndex =
        (currentSongIndex - 1 + SONGS[request.mode].length) %
        SONGS[request.mode].length;
    } else if (request.next) {
      currentSongIndex = (currentSongIndex + 1) % SONGS[request.mode].length;
    }

    let songUrl = SONGS[request.mode][currentSongIndex].src;

    if (!songUrl) {
      songUrl = SONGS[request.mode][0].src;
      currentSongIndex = 0;
    }

    chrome.runtime.sendMessage({ action: "play", url: songUrl });
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

    chrome.alarms.clear("resetBreakAlarm");
    chrome.alarms.clear("genericAlarm", () => {
      chrome.alarms.create("genericAlarm", {
        delayInMinutes,
      });
    });
  }

  if (request.action === "resetBreakAlarm") {
    chrome.alarms.clear("resetBreakAlarm");
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
    const request = indexedDB.open("intent", 3);

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

const handleMigration = async () => {
  const db = await openDB();
  const transaction = db.transaction("todos", "readwrite");
  const store = transaction.objectStore("todos");

  const getAllRequest = store.getAll();

  getAllRequest.onsuccess = async (event) => {
    const originalTasks = event.target.result;

    const categoryBasedTasks = originalTasks.reduce((acc, task) => {
      if (!acc[task.categoryId]) {
        acc[task.categoryId] = [];
      }
      acc[task.categoryId].push(task);
      return acc;
    }, {});

    for (const categoryId in categoryBasedTasks) {
      const tasks = categoryBasedTasks[categoryId];

      const nonCompletedTasks = tasks.filter((task) => !task.isCompleted);
      const completedTasks = tasks.filter((task) => task.isCompleted);
      const tasksWithOrder = [
        ...nonCompletedTasks.map((task, index) => ({
          ...task,
          order: index,
        })),
        ...completedTasks.map((task, index) => ({
          ...task,
          order: nonCompletedTasks.length + index,
        })),
      ];

      for (const task of tasksWithOrder) {
        store.put(task);
      }
    }
  };

  getAllRequest.onerror = (err) => {
    console.error("Failed to fetch todos for migration:", err);
  };
};

chrome.runtime.onInstalled.addListener(async (details) => {
  const { reason } = details;
  if (reason === chrome.runtime.OnInstalledReason.UPDATE) {
    await handleMigration();
  }
});
