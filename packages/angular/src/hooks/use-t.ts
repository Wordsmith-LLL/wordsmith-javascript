import { Injectable } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Injectable({
  providedIn: 'root',
})
export class UseTHook {
  constructor(private translationService: TranslationService) {}

  t(str: string, options: any = {}) {
    return this.translationService.translate(str, options);
  }
}
