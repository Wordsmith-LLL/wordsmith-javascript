import { Component, Input } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'ws-ut',
  template: '<ng-container [innerHTML]="translatedHtml"></ng-container>',
})
export class UTComponent {
  @Input() _str!: string;
  @Input() _inline: boolean = false;

  translatedHtml: string = '';

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.updateTranslation();
  }

  ngOnChanges() {
    this.updateTranslation();
  }
  private async updateTranslation() {
    this.translatedHtml = await this.translationService.translate(this._str, {
      _inline: this._inline,
      _escapeVars: true,
      ...this.getInputProps(),
    });
  }

  private getInputProps() {
    return Object.keys(this)
      .filter(key => !key.startsWith('_') && key !== 'translatedHtml')
      .reduce((obj, key) => ({ ...obj, [key]: this[key as keyof this] }), {} as Record<string, unknown>);
  }
}
