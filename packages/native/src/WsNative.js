import fetch from 'cross-fetch';

export default class WsNative {
  constructor(apiKey, apiHost = 'https://api.wordsmith.is') {
    this.apiKey = apiKey;
    this.apiHost = apiHost;
    this.currentLocale = 'en-US';
  }

  async fetchWithAuth(url, options = {}) {
    const headers = {
      Authorization: `Token ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'WsNative/2.0',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  async translate(message, targetLocale, sourceLocale = 'en-US') {
    const url = `${this.apiHost}/i18next/translate`;
    const body = JSON.stringify({ message, sourceLocale, targetLocale });
    const result = await this.fetchWithAuth(url, { method: 'POST', body });
    return result.data || message;
  }

  async t(message, options = {}) {
    const targetLocale = options.targetLocale || this.currentLocale;
    const sourceLocale = options.sourceLocale || 'en-US';
    return this.translate(message, targetLocale, sourceLocale);
  }

  async getLocales() {
    const url = `${this.apiHost}/i18next/locales`;
    return this.fetchWithAuth(url);
  }

  setCurrentLocale(locale) {
    this.currentLocale = locale;
  }
}
