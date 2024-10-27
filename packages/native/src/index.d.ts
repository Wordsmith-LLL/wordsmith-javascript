declare class WsNative {
  constructor(apiKey: string, apiHost?: string);
  fetchWithAuth(url: string, options?: RequestInit): Promise<any>;
  translate(message: string, targetLocale: string, sourceLocale?: string): Promise<string>;
  t(message: string, options?: any): Promise<string>;
  getLocales(): Promise<Array<{code: string, name: string}>>;
  setCurrentLocale(locale: string): void;
  getCurrentLocale(): string;
}

export const ws: WsNative;
export const t: (message: string, options?: any) => Promise<string>;
export const onEvent: (event: string, callback: Function) => void;
export const offEvent: (event: string, callback: Function) => void;
export const LOCALE_CHANGED: string;

export default WsNative;
