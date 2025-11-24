import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// List of supported locales - single source of truth
export const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];

// Helper function to normalize and validate language
const normalizeAndValidateLanguage = (lng: string | string[]): string => {
    // Handle array case (fallback chain)
    if (Array.isArray(lng)) {
        for (const lang of lng) {
            const normalized = normalizeAndValidateLanguage(lang);
            if (supportedLanguages.includes(normalized)) {
                return normalized;
            }
        }
        return 'en';
    }
    
    // Handle string case
    if (!lng || typeof lng !== 'string') {
        return 'en';
    }
    
    // Normalize: extract base language code (e.g., 'en' from 'en-GB')
    const normalizedLng = lng.split('-')[0].toLowerCase();
    
    // Validate against supported list
    return supportedLanguages.includes(normalizedLng) ? normalizedLng : 'en';
};

// Custom function to save language to chrome.storage and localStorage
const saveLanguage = (lng: string) => {
    // Save to localStorage (for i18next detector)
    localStorage.setItem('i18nextLng', lng);
    
    // Also save to chrome.storage for cross-tab persistence
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ i18nextLng: lng });
    }
};

// Initialize i18n
const initI18n = async () => {
    let initialLanguage: string | null = null;
    
    // Try to get language from chrome.storage first (for cross-tab sync)
    if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
            const result = await chrome.storage.local.get('i18nextLng');
            if (result.i18nextLng) {
                initialLanguage = normalizeAndValidateLanguage(result.i18nextLng);
                // Sync to localStorage for i18next detector
                localStorage.setItem('i18nextLng', initialLanguage);
            }
        } catch (error) {
            console.error('Error reading language from chrome.storage:', error);
        }
    }
    
    // If not found in chrome.storage, check localStorage
    if (!initialLanguage) {
        const stored = localStorage.getItem('i18nextLng');
        if (stored) {
            initialLanguage = normalizeAndValidateLanguage(stored);
        }
    }

    i18n
        .use(Backend)
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            lng: initialLanguage || undefined, // Use detected language if available
            fallbackLng: 'en',
            supportedLngs: supportedLanguages,
            debug: process.env.NODE_ENV === 'development',
            interpolation: {
                escapeValue: false,
            },
            backend: {
                loadPath: '/locales/{{lng}}/translation.json',
                load: 'languageOnly',
                allowMultiLoading: false,
                requestOptions: {
                    cache: 'default'
                },
            },
            detection: {
                order: ['localStorage', 'navigator'],
                caches: ['localStorage'],
                lookupLocalStorage: 'i18nextLng',
                convertDetectedLanguage: (lng) => {
                    return normalizeAndValidateLanguage(lng);
                },
            },
            saveMissing: false,
            missingKeyHandler: false,
        });

    // Override changeLanguage to save to chrome.storage
    const originalChangeLanguage = i18n.changeLanguage.bind(i18n);
    i18n.changeLanguage = (lng?: string | string[], callback?: (error: any, t: any) => void) => {
        const validatedLng = normalizeAndValidateLanguage(lng || 'en');
        saveLanguage(validatedLng);
        return originalChangeLanguage(validatedLng, callback);
    };

    // Listen for chrome.storage changes (when language changes in another tab)
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.i18nextLng && changes.i18nextLng.newValue) {
                const newLang = normalizeAndValidateLanguage(changes.i18nextLng.newValue);
                if (newLang !== i18n.language) {
                    // Sync to localStorage
                    localStorage.setItem('i18nextLng', newLang);
                    // Change language (this will trigger re-renders)
                    originalChangeLanguage(newLang);
                }
            }
        });
    }
};

// Initialize asynchronously
initI18n();

export default i18n;
