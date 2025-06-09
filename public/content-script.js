/* eslint-disable no-undef */
const applyDarkTheme = (intentSettings) => {
  const body = document.querySelector("body");
  if (body && intentSettings.sendBreakReminder) {
    const style = document.createElement("style");
    style.id = "dark-theme-style";
    style.innerHTML = `
      body *:not(#break-tooltip-intent, #break-tooltip-intent *, #event-tooltip-intent, #event-tooltip-intent *) {
      filter: grayscale(100%);
      transition: filter 1s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }

  const existingTooltip = document.getElementById("break-tooltip-intent");

  if (!existingTooltip && intentSettings.sendBreakReminder) {
    showBreakTooltip();
  }
};

const removeDarkTheme = () => {
  const body = document.querySelector("body");
  if (body) {
    const existingStyle = document.getElementById("dark-theme-style");
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  const existingTooltip = document.getElementById("break-tooltip-intent");
  if (existingTooltip) {
    existingTooltip.remove();
  }
};

const handleTurnOffReminders = () => {
  chrome.runtime.sendMessage({ action: "resetBreakAlarm" });
  chrome.storage.local.get("intentSettings", (data) => {
    if (data.intentSettings) {
      chrome.storage.local.set({
        intentSettings: {
          ...data.intentSettings,
          sendBreakReminder: false,
          activePage: "Todo",
          lastUpdatedAt: Date.now(),
        },
      });
    }
  });
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

  if (data.intentSettings.sendBreakReminder) {
    chrome.runtime.sendMessage({ action: "setAlarm", delayInMinutes: minutes });
  }
};

const handleEndBreak = async () => {
  chrome.runtime.sendMessage({ action: "resetBreakAlarm" });

  const data = await chrome.storage.local.get("intentSettings");

  if (!data || !data.intentSettings) {
    return;
  }

  chrome.storage.local.set({
    intentSettings: {
      ...data.intentSettings,
      activePage: "Todo",
      lastUpdatedAt: Date.now(),
    },
  });

  const { breakInterval = 90, workingHours = ["09:00", "17:00"] } = data.intentSettings;

  const now = new Date();
  const currentEpoch = now.getTime();
  const breakDuration = breakInterval * 60 * 1000;
  const endHour = workingHours[1];
  const endTime = new Date();

  endTime.setHours(
    Number(endHour.split(":")[0]),
    Number(endHour.split(":")[1]),
    0,
    0,
  );

  const workingHourEnd = endTime.getTime();

  if (
    currentEpoch + breakDuration <= workingHourEnd &&
    data.intentSettings.sendBreakReminder
  ) {
    chrome.runtime.sendMessage({
      action: "setAlarm",
      delayInMinutes: (currentEpoch + breakDuration - Date.now()) / 60000,
    });
  }
};

chrome.storage.onChanged.addListener((changes) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (
      key === "intentSettings" &&
      oldValue.activePage !== newValue.activePage
    ) {
      if (newValue.activePage === "Break") {
        applyDarkTheme(newValue);
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

    if (key === "linkboard" && oldValue !== newValue) {
      const existingTooltip = document.getElementById(
        "item-saved-tooltip-intent",
      );
      if (existingTooltip) {
        existingTooltip.remove();
      }
      showItemSavedTooltip();
    }
  }
});

chrome.storage.local.get(["intentSettings"]).then((result) => {
  if (
    result &&
    result.intentSettings &&
    result.intentSettings.activePage === "Break"
  ) {
    applyDarkTheme(result.intentSettings);
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
  tooltip.style.fontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`; // <<< important addition
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
        clearInterval();
      });
    });
};

const showBreakTooltip = () => {
  const tooltip = document.createElement("div");
  tooltip.style.position = "fixed";
  tooltip.id = "break-tooltip-intent";
  tooltip.style.top = "20px";
  tooltip.style.left = "50%";
  tooltip.style.transform = "translateX(-50%)";
  tooltip.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
  tooltip.style.borderRadius = "12px";
  tooltip.style.zIndex = 2147483647;
  tooltip.style.maxWidth = "95%";
  tooltip.style.padding = "12px";
  tooltip.style.backgroundColor = "#eff6ff";
  tooltip.style.fontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
  tooltip.style.color = "#1c398e";
  tooltip.style.fontSize = "14px";
  tooltip.style.width = "725px";

  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span id="blinking-icon" style="font-size: 16px;">⏳</span>
      <span><strong>Time for a break!</strong> Step away, refresh your mind, and come back energized. 💙</span>
    </div>
    <div style="margin-top: 10px; display: flex; justify-content: space-between; gap: 8px;">
      <button id="postpone-5" style="flex: 1; padding: 8px 4px; background: #2b7fff; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Postpone 5 min</button>
      <button id="postpone-10" style="flex: 1; padding: 8px 4px; background: #2b7fff; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Postpone 10 min</button>
      <button id="turn-off-reminders" style="flex: 1; padding: 8px 4px; background: #ff7043; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Turn off break reminders</button>
      <button id="end-break" style="flex: 1; padding: 8px 4px; background: #f04438; color: #fff; border: none; border-radius: 6px; cursor: pointer;">End break</button>
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

  document
    .getElementById("turn-off-reminders")
    .addEventListener("click", () => {
      tooltip.remove();
      handleTurnOffReminders();
    });
};

const showItemSavedTooltip = () => {
  // Inject animation styles once
  if (!document.getElementById("item-saved-tooltip-style")) {
    const style = document.createElement("style");
    style.id = "item-saved-tooltip-style";
    style.textContent = `
      @keyframes fadeSlideDown {
        0% { opacity: 0; transform: translate(-50%, -12px); }
        100% { opacity: 1; transform: translate(-50%, 0); }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    `;
    document.head.appendChild(style);
  }

  const tooltip = document.createElement("div");
  tooltip.id = "item-saved-tooltip-intent";
  tooltip.style.position = "fixed";
  tooltip.style.top = "20px";
  tooltip.style.left = "50%";
  tooltip.style.transform = "translateX(-50%)";
  tooltip.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.1)";
  tooltip.style.borderRadius = "10px";
  tooltip.style.border = "1px solid #d1d5db";
  tooltip.style.zIndex = "2147483647";
  tooltip.style.maxWidth = "90%";
  tooltip.style.padding = "10px 16px";
  tooltip.style.background = "#ffffff";
  tooltip.style.color = "#111827";
  tooltip.style.fontSize = "14px";
  tooltip.style.fontWeight = "500";
  tooltip.style.fontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
  tooltip.style.opacity = "0";
  tooltip.style.animation = "fadeSlideDown 300ms ease-out forwards";

  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 18px; animation: pulse 1.2s infinite;">✅</span>
      <span><strong>Saved to Linkboard</strong> successfully.</span>
    </div>
  `;

  document.body.appendChild(tooltip);

  setTimeout(() => {
    tooltip.remove();
  }, 3000);
};
