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
      if(newValue && newValue.start > Date.now()) {
        showTooltip(newValue);
      } else {
        const existingTooltip = document.getElementById('event-tooltip-intent');
        if (existingTooltip) {
          existingTooltip.remove();
        }
        if(newValue) {
          chrome.storage.local.set({ event: null });
        }
      }
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
    if(result.event.start > Date.now()) {
      showTooltip(result.event);
    } else {
      const existingTooltip = document.getElementById('event-tooltip-intent');
      if (existingTooltip) {
        existingTooltip.remove();
      }
      chrome.storage.local.set({ event: null });
    }
  }
});

const showTooltip = (event) => {
  const tooltip = document.createElement("div");
  tooltip.style.position = "fixed";
  tooltip.id = "event-tooltip-intent";
  tooltip.style.top = "20px";
  tooltip.style.left = "50%";
  tooltip.style.transform = "translateX(-50%)";
  tooltip.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
  tooltip.style.borderRadius = "12px";
  tooltip.style.zIndex = 2147483647;
  tooltip.style.maxWidth = "100%";
  tooltip.style.padding = "4px 8px";
  tooltip.style.backgroundColor = "#FFF4E5";
  tooltip.style.color = "#333";
  tooltip.style.border = "1px solid #FF7043";

  const timeToStartEvent = event.start - Date.now();
  const timeToStartEventInMinutes = Math.round(timeToStartEvent / 60000);

  // Tooltip content with blinking icon at the start
  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 14px; gap: 10px;">
      <span id="blinking-icon">🔔</span> <strong>${event.title}</strong> starts in <strong>${timeToStartEventInMinutes} minutes</strong>
      <button id="understood-button-${event.id}" style="padding: 4px 8px; background: #FF7043; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Understood</button>
    </div>
  `;

  document.body.appendChild(tooltip);

  // Blink the icon to grab attention
  const blinkingIcon = document.getElementById("blinking-icon");
  setInterval(() => {
    blinkingIcon.style.visibility = blinkingIcon.style.visibility === 'hidden' ? 'visible' : 'hidden';
  }, 500);

  document.getElementById(`understood-button-${event.id}`).addEventListener("click", () => {
    chrome.storage.local.set({ event: null }, () => {
      tooltip.remove();
      clearInterval(interval);
    });
  });
};
