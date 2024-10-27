import { Component, Input } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'ws-t',
  template: '{{ translatedText }}',
})
export class TComponent {
  @Input() _str!: string;
  @Input() _inline: boolean = false;

  translatedText: string = '';

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.updateTranslation();
  }

  ngOnChanges() {
    this.updateTranslation();
  }
  private async updateTranslation() {
    this.translatedText = await this.translationService.translate(this._str, {
      _inline: this._inline,
      ...this.getInputProps(),
    });
  }

  private getInputProps() {
    return Object.keys(this)
      .filter(key => !key.startsWith('_') && key !== 'translatedText')
      .reduce((obj, key) => ({ ...obj, [key]: this[key as keyof this] }), {} as Record<string, unknown>);
  }
}
