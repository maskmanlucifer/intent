/* eslint-disable no-undef */
const applyDarkTheme = () => {
  document.querySelector("body").style.filter = "grayscale(100%)";
  document.querySelector("body").style.transition = "filter 1s ease-in-out";
};

const removeDarkTheme = () => {
  document.querySelector("body").style.filter = "grayscale(0%)";
  document.querySelector("body").style.transition = "filter 1s ease-in-out";
};

chrome.storage.onChanged.addListener((changes) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === "breakActive" && oldValue !== newValue) {
      if (newValue) {
        applyDarkTheme();
      } else {
        removeDarkTheme();
      }
    }
  }
});

chrome.storage.local.get(["breakActive"]).then((result) => {
  if (result && result.breakActive) {
    applyDarkTheme();
  }
});
