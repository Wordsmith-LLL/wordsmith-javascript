import { createNativeInstance, explodePlurals } from '@wordsmith/native';

export default class WordsmithI18next {
  constructor(options) {
    this.type = 'backend';
    this.options = options || {};
    this.init();
  }

  init(services, backendOptions) {
    this.options = {
      ...(this.options || {}),
      ...(backendOptions || {}),
    };
    this.ws = createNativeInstance(this.options);
  }

  read(language, namespace, callback) {
    this.ws.fetchTranslations(language).then(() => {
      callback(
        null,
        this._convertPlurals(this.ws.cache.getTranslations(language)),
      );
    }).catch((err) => {
      callback(err, null);
    });
  }

  readMulti(languages, namespaces, callback) {
    const promises = [];
    languages.forEach((language) => {
      promises.push(this.ws.fetchTranslations(language));
    });

    Promise.all(promises).then(() => {
      const data = {};
      languages.forEach((language) => {
        data[language] = {
          translations:
            this._convertPlurals(this.ws.cache.getTranslations(language)),
        };
      });
    }).catch((err) => {
      callback(err, null);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  _convertPlurals(translations) {
    const data = {};
    Object.keys(translations).forEach((key) => {
      if (!key.endsWith('_wsplural')) {
        data[key] = translations[key];
        return;
      }
      const baseKey = key.slice(0, -('_wsplural'.length));
      const plurals = explodePlurals(translations[key].replace('{???,', '{count,'))[1];
      Object.keys(plurals).forEach((plural) => {
        data[`${baseKey}_${plural}`] = plurals[plural];
      });
    });
    return data;
  }
}
