import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import WsNative from '@wordsmith/native';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private wsNative: WsNative;
  private currentLocaleSubject = new BehaviorSubject<string>('en-US');

  constructor(@Inject(process.env['WORDSMITH_API_TOKEN']) private apiKey: string) {
    this.wsNative = new WsNative(this.apiKey);
  }
  async translate(str: string, options: any = {}): Promise<string> {
    return this.wsNative.t(str, options);
  }

  async setCurrentLocale(locale: string): Promise<void> {
    await this.wsNative.setCurrentLocale(locale);
    this.currentLocaleSubject.next(locale);
  }

  getCurrentLocale() {
    return this.currentLocaleSubject.asObservable();
  }

  async getLocales() {
    return this.wsNative.getLocales();
  }
}
