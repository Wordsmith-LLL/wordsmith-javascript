import { Component, OnInit, Input } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'ws-language-picker',
  template: `
    <select [ngClass]="className" (change)="onLanguageChange($event)">
      <option *ngFor="let lang of languages" [value]="lang.code" [selected]="lang.code === currentLocale">
        {{ lang.name }}
      </option>
    </select>
  `
})
export class LanguagePickerComponent implements OnInit {
  @Input() className: string = '';
  languages: { code: string, name: string }[] = [];
  currentLocale: string = '';

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.loadLanguages();
    this.translationService.getCurrentLocale().subscribe(locale => {
      this.currentLocale = locale;
    });
  }

  async loadLanguages() {
    this.languages = await this.translationService.getLocales();
  }

  onLanguageChange(event: Event) {
    const selectedLocale = (event.target as HTMLSelectElement).value;
    this.translationService.setCurrentLocale(selectedLocale);
  }
}
