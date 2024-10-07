import {supportedLocales} from '../../config/i18n';

const translationLoader = {
  type: 'backend',
  init: () => {},
  read: function(language: keyof typeof supportedLocales, namespace: string, callback: (error: any, resource: any) => void) {
    let resource, error = null;
    try {
      resource = supportedLocales[language]
        .translationFileLoader()[namespace];
    } catch (_error) { error = _error; }
    callback(error, resource);
  },
};

export default translationLoader;
