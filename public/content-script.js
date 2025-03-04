/* eslint-disable no-undef */
const applyDarkTheme = () => {
  const body = document.querySelector("body");
  if (body) {
    body.style.filter = "grayscale(100%)";
    body.style.transition = "filter 1s ease-in-out";
  }
};

const removeDarkTheme = () => {
  const body = document.querySelector("body");
  if (body) {
    body.style.filter = "grayscale(0%)";
    body.style.transition = "filter 1s ease-in-out";
  }
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

    if (key === "event" && oldValue !== newValue) {
      showTooltip(newValue);
    }
  }
});

chrome.storage.local.get(["breakActive"]).then((result) => {
  if (result && result.breakActive) {
    applyDarkTheme();
  }
});

chrome.storage.local.get(["event"]).then((result) => {
  if (result && result.event) {
    showTooltip(result.event);
  }
});

const showTooltip = (event) => {
  const tooltip = document.createElement("div");
  tooltip.style.position = "fixed";
  tooltip.id = "event-tooltip-intent";
  tooltip.style.top = "20px";
  tooltip.style.left = "20px";
  tooltip.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
  tooltip.style.borderRadius = "4px";
  tooltip.style.zIndex = 2147483647;

  if(event === null) {
    const existingTooltip = document.getElementById('event-tooltip-intent');
    if (existingTooltip) {
      existingTooltip.remove();
    }
  }

  if(event.start < Date.now()) {
    const existingTooltip = document.getElementById('event-tooltip-intent');
    if (existingTooltip) {
      existingTooltip.remove();
    }
    return;
  }
  
  const timeToStartEvent = new Date(event.start) - Date.now();
  const timeToStartEventInMinutes = Math.round(timeToStartEvent / 60000);

  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; background-color: #f0f0f0; padding: 4px; border-radius: 5px; border: 1px solid #ddd;">
    🗓 ${event.title} will start in ${timeToStartEventInMinutes} minutes.
      <br />
      <button id="understood-button-${event.id}" style="padding: 6px 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Understood</button>
    </div>
  `;

  document.body.appendChild(tooltip);

  document.getElementById(`understood-button-${event.id}`).addEventListener("click", () => {
    chrome.storage.local.set({ event: null }, () => {});
  });
};
