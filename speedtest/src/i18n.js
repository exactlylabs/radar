import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import yaml from 'js-yaml';

// Function to load YAML files
const loadYamlResource = async (lng, ns) => {
  try {
    const url = `/locales/${lng}/${ns}.yml`;
    console.log(`Loading translation from: ${url}`);
    const response = await fetch(url);
    console.log(`Response status: ${response.status}`);
    const text = await response.text();
    console.log(`Response text (first 100 chars): ${text.substring(0, 100)}`);
    const data = yaml.load(text);
    console.log(`Parsed YAML data:`, data);
    return data;
  } catch (error) {
    console.error(`Failed to load translation for ${lng}/${ns}:`, error);
    return {};
  }
};

// Custom backend to load YAML files
const yamlBackend = {
  type: 'backend',
  init: function() {},
  read: function(language, namespace, callback) {
    loadYamlResource(language, namespace)
      .then((data) => callback(null, data))
      .catch((error) => callback(error, null));
  }
};

const initPromise = i18n
  // Use custom YAML backend
  .use(yamlBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    fallbackLng: 'en',
    lng: 'en', // Default language
    debug: false, // Set to true for development debugging
    supportedLngs: ['en', 'es'], // Supported languages

    ns: ['translation'], // Namespace
    defaultNS: 'translation',

    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng'
    },

    react: {
      useSuspense: false, // Set to false to avoid needing Suspense boundary
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    }
  });

export { initPromise };
export default i18n;