/* eslint-disable no-undef */

// Static translations for background script
const OG_FETCHER_URL = "__REACT_APP_OG_FETCHER_URL__";

const TRANSLATIONS = {
  en: "Save to Intent",
  zh: "保存到 Intent",
  es: "Guardar en Intent",
  fr: "Enregistrer dans Intent",
  de: "In Intent speichern",
  it: "Salva in Intent",
  pt: "Salvar no Intent",
  ru: "Сохранить в Intent",
  ja: "Intentに保存",
  ko: "Intent에 저장",
};

// List of supported languages (should match i18n.ts)
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];

// Normalize and validate language code
const normalizeLanguage = (lng) => {
  if (!lng || typeof lng !== 'string') return 'en';
  const normalized = lng.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : 'en';
};

// Get translation based on stored language preference
const getTranslation = async () => {
  try {
    const result = await chrome.storage.local.get('i18nextLng');
    const language = normalizeLanguage(result.i18nextLng || 'en');
    return TRANSLATIONS[language] || TRANSLATIONS.en;
  } catch (error) {
    console.error('Error reading language preference:', error);
    return TRANSLATIONS.en;
  }
};

// Update context menu when language changes
const updateContextMenu = async () => {
  const title = await getTranslation();
  chrome.contextMenus.update('save-to-intent', { title });
};

// Listen for language changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.i18nextLng) {
    updateContextMenu();
  }
});

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
      `${OG_FETCHER_URL}/preview/?url=${encodeURIComponent(tab.url)}`,
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

chrome.runtime.onInstalled.addListener(async () => {
  const title = await getTranslation();
  chrome.contextMenus.create({
    id: "save-to-intent",
    title: title,
    contexts: ["image", "link"],
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
  if (info.menuItemId !== "save-to-intent") {
    return;
  }

  const hasImage = Boolean(info.mediaType === "image" || info.srcUrl);
  const hasLink = Boolean(info.linkUrl);

  const isImageAction = hasImage && (!hasLink || info.mediaType === "image");
  const url = isImageAction ? info.srcUrl : info.linkUrl || info.srcUrl;

  if (!url) return;

  if (!url.startsWith("http")) {
    return;
  }

  const linkData = {
    id: Date.now().toString(),
    url: url,
    createdAt: Date.now(),
  };

  if (isImageAction) {
    linkData.type = "image";
    linkData.imageUrl = url;
  } else if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
    linkData.type = "video";
    linkData.imageUrl = getYouTubeThumbnailUrl(url);
  } else {
    linkData.type = "webpage";
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
    `${OG_FETCHER_URL}/preview/?url=${encodeURIComponent(url)}`,
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

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("intent", 4);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
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
