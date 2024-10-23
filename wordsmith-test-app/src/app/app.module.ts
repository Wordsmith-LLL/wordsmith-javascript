import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WsNativeModule, TranslationService } from '@wordsmith/angular';
import { AppComponent } from './app.component';

export function initializeWordsmith(translationService: TranslationService) {
  return () => translationService.init({
    token: process.env['WORDSMITH_API_TOKEN'] || '',
  });
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    WsNativeModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeWordsmith,
      deps: [TranslationService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }