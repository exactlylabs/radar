import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import yaml from 'js-yaml';

// Function to load YAML files
const loadYamlResource = async (lng, ns) => {
  try {
    const response = await fetch(`/locales/${lng}/${ns}.yml`);
    const text = await response.text();
    return yaml.load(text);
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

i18n
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
      useSuspense: true // Set to false if you don't want to use Suspense
    }
  });

export default i18n;