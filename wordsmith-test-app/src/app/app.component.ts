import { Component, OnInit } from '@angular/core';
import { TranslationService } from '@wordsmith/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentDate = new Date();

  constructor(private translationService: TranslationService) {}

  async ngOnInit() {
    await this.translationService.getLanguages();
    await this.translationService.setCurrentLocale('en');
  }

  onLocaleChanged(locale: string) {
    this.translationService.setCurrentLocale(locale);
  }
}