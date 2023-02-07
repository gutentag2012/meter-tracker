import * as Localization from 'expo-localization';
import { LanguageDetectorAsyncModule, Module } from 'i18next'

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: (callback: (language: string) => void) => {
    // We will get back a string like "en-US". We
    // return a string like "en" to match our language
    // files.
    callback(Localization.locale.split('-')[0]);
  },
  init: () => { },
  cacheUserLanguage: () => { },
};
export default languageDetector;
