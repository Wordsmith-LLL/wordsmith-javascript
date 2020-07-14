import { expect } from 'chai';
import {
  setTranslations,
  getTranslations,
  hasTranslations,
  getTranslation
} from '../src/cache';

describe('Cache functions', () => {
  it('work on empty cache', () => {
    expect(getTranslation('foo', 'bar')).to.equal('');
    expect(hasTranslations('foo')).to.equal(false);
    expect(getTranslations('foo')).to.deep.equal({});
  });

  it('work on valid cache', () => {
    setTranslations('fr', { 'key': 'value' })
    expect(getTranslation('fr', 'bar')).to.equal('');
    expect(getTranslation('fr', 'key')).to.equal('value');
    expect(hasTranslations('fr')).to.equal(true);
    expect(getTranslations('fr')).to.deep.equal({ 'key': 'value' });
  });
});