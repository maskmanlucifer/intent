/* eslint-disable no-undef */

// Static translations for content script
const TRANSLATIONS = {
  en: "Saved to Intent successfully.",
  zh: "已成功保存到 Intent。",
  es: "Guardado en Intent con éxito.",
  fr: "Enregistré dans Intent avec succès.",
  de: "Erfolgreich in Intent gespeichert.",
  it: "Salvato in Intent con successo.",
  pt: "Salvo no Intent com sucesso.",
  ru: "Успешно сохранено в Intent.",
  ja: "Intentに正常に保存されました。",
  ko: "Intent에 성공적으로 저장되었습니다.",
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

const showItemSavedTooltip = async () => {
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

  // Get translated message
  const message = await getTranslation();

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
        <span><strong style="color: #111827;">${message}</strong></span>
      </div>
    `;

  document.body.appendChild(tooltip);

  setTimeout(() => {
    tooltip.remove();
  }, 3000);
};