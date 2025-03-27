/* eslint-disable no-undef */
const applyDarkTheme = () => {
  const body = document.querySelector("body");
  if (body) {
    body.style.filter = "grayscale(100%)";
    body.style.transition = "filter 1s ease-in-out";
  }

  const existingTooltip = document.getElementById("break-tooltip-intent");

  if (!existingTooltip) {
    showBreakTooltip();
  }
};

const removeDarkTheme = () => {
  const body = document.querySelector("body");
  if (body) {
    body.style.filter = "grayscale(0%)";
    body.style.transition = "filter 1s ease-in-out";
  }

  const existingTooltip = document.getElementById("break-tooltip-intent");
  if (existingTooltip) {
    existingTooltip.remove();
  }
};

const handleBreakPostpone = (minutes) => {
  chrome.storage.local.get("intentSettings", (data) => {
    if (data.intentSettings) {
      chrome.storage.local.set({
        intentSettings: {
          ...data.intentSettings,
          activePage: "Todo",
          lastUpdatedAt: Date.now(),
        },
      });
    }
  });

  chrome.alarms.clear("genericAlarm", () => {
    chrome.alarms.create("genericAlarm", {
      delayInMinutes: minutes,
    });
  });
};

const handleEndBreak = () => {
  chrome.storage.local.get("intentSettings", (data) => {
    if (data.intentSettings) {
      chrome.storage.local.set({
        intentSettings: {
          ...data.intentSettings,
          activePage: "Todo",
          lastUpdatedAt: Date.now(),
        },
      });
    }
  });
};

chrome.storage.onChanged.addListener((changes) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (
      key === "intentSettings" &&
      oldValue.activePage !== newValue.activePage
    ) {
      if (newValue.activePage === "Break") {
        applyDarkTheme();
      } else {
        removeDarkTheme();
      }
    }

    if (key === "event" && oldValue !== newValue) {
      if (newValue && newValue.start > Date.now()) {
        showTooltip(newValue);
      } else {
        const existingTooltip = document.getElementById("event-tooltip-intent");
        if (existingTooltip) {
          existingTooltip.remove();
        }
        if (newValue) {
          chrome.storage.local.set({ event: null });
        }
      }
    }
  }
});

chrome.storage.local.get(["intentSettings"]).then((result) => {
  if (
    result &&
    result.intentSettings &&
    result.intentSettings.activePage === "Break"
  ) {
    applyDarkTheme();
  }
});

chrome.storage.local.get(["event"]).then((result) => {
  if (result && result.event) {
    if (result.event.start > Date.now()) {
      showTooltip(result.event);
    } else {
      const existingTooltip = document.getElementById("event-tooltip-intent");
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

  const eventStartTime = new Date(event.start);
  const hours = eventStartTime.getHours() % 12 || 12;
  const minutes = eventStartTime.getMinutes().toString().padStart(2, "0");
  const ampm = eventStartTime.getHours() >= 12 ? "PM" : "AM";
  const timeToStart = `${hours}:${minutes} ${ampm}`;

  // Tooltip content with blinking icon at the start
  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 14px; gap: 10px;">
      <span id="blinking-icon">🔔</span> <strong>${event.title}</strong> starts at <strong>${timeToStart}</strong>
      <button id="understood-button-${event.id}" style="padding: 4px 8px; background: #FF7043; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Got it</button>
    </div>
  `;

  document.body.appendChild(tooltip);

  // Blink the icon to grab attention
  const blinkingIcon = document.getElementById("blinking-icon");
  setInterval(() => {
    blinkingIcon.style.visibility =
      blinkingIcon.style.visibility === "hidden" ? "visible" : "hidden";
  }, 500);

  document
    .getElementById(`understood-button-${event.id}`)
    .addEventListener("click", () => {
      chrome.storage.local.set({ event: null }, () => {
        tooltip.remove();
        clearInterval(interval);
      });
    });
};

export const showBreakTooltip = () => {
  const tooltip = document.createElement("div");
  tooltip.style.position = "fixed";
  tooltip.id = "break-tooltip-intent";
  tooltip.style.top = "20px";
  tooltip.style.left = "50%";
  tooltip.style.transform = "translateX(-50%)";
  tooltip.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
  tooltip.style.borderRadius = "12px";
  tooltip.style.zIndex = 2147483647;
  tooltip.style.maxWidth = "90%";
  tooltip.style.padding = "12px";
  tooltip.style.backgroundColor = "#eff6ff"; // Blue-50
  tooltip.style.color = "#1c398e"; // Blue-900
  tooltip.style.fontSize = "14px";

  // Tooltip content
  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span id="blinking-icon" style="font-size: 16px;">⏳</span>
      <span><strong>Time for a break!</strong> Step away, refresh your mind, and come back energized. 💙</span>
    </div>
    <div style="margin-top: 10px; display: flex; justify-content: space-between; gap: 8px;">
      <button id="postpone-5" style="flex: 1; padding: 6px 10px; background: #2b7fff; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Postpone 5 min</button>
      <button id="postpone-10" style="flex: 1; padding: 6px 10px; background: #2b7fff; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Postpone 10 min</button>
      <button id="end-break" style="flex: 1; padding: 6px 10px; background: #f04438; color: #fff; border: none; border-radius: 6px; cursor: pointer;">End break</button>
    </div>
  `;

  document.body.appendChild(tooltip);

  document.getElementById("postpone-5").addEventListener("click", () => {
    tooltip.remove();
    handleBreakPostpone(5);
  });

  document.getElementById("postpone-10").addEventListener("click", () => {
    tooltip.remove();
    handleBreakPostpone(10);
  });

  document.getElementById("end-break").addEventListener("click", () => {
    tooltip.remove();
    handleEndBreak();
  });
};
