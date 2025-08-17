import AsyncStorage from '@react-native-async-storage/async-storage';

export const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: callback => {
    AsyncStorage.getItem('user-language', (err, language) => {
      if (err || !language) {
        if (err) {
          // console.log('Error fetching Languages from asyncstorage ', err);
        } else {
          // console.log('No language is set, choosing English as fallback');
        }
        callback('en');
        return;
      }
      callback(language);
    });
  },
  init: () => {},
  cacheUserLanguage: language => {
    AsyncStorage.setItem('user-language', language);
  },
};
