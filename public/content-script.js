/* eslint-disable no-undef */


chrome.storage.onChanged.addListener((changes) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {  
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