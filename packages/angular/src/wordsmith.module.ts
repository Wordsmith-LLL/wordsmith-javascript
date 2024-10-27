import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TComponent } from './components/t.component';
import { UTComponent } from './components/ut.component';
import { LanguagePickerComponent } from './components/language-picker.component';
import { TranslationService } from './services/translation.service';

@NgModule({
  declarations: [TComponent, UTComponent, LanguagePickerComponent],
  imports: [CommonModule],
  exports: [TComponent, UTComponent, LanguagePickerComponent],
})
export class WordsmithModule {
  static forRoot(apiKey: string): ModuleWithProviders<WordsmithModule> {
    return {
      ngModule: WordsmithModule,
      providers: [
        TranslationService,
        { provide: process.env['WORDSMITH_API_TOKEN'], useValue: apiKey }
      ]
    };
  }
}
