/* eslint-disable no-undef */

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
    id: "save-to-intent",
    title: "Save to Intent",
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
