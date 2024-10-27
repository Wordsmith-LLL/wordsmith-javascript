import { expect } from 'chai';
import nock from 'nock';
import { createNativeInstance } from '../src/index';

describe('ws instance', () => {
  let t;
  let ws;

  beforeEach(() => {
    ws = createNativeInstance({
      bearerToken: 'test-token',
      tenantClientId: 'test-tenant',
    });
    t = ws.t.bind(ws);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('initializes with correct values', () => {
    expect(ws.bearerToken).to.equal('test-token');
    expect(ws.tenantClientId).to.equal('test-tenant');
  });

  it('getLocales fetches locales', async () => {
    nock(ws.apiHost)
      .get('/i18next/locales')
      .reply(200, {
        data: [
          {
            name: 'Greek',
            code: 'el',
            localized_name: 'Ελληνικά',
            rtl: false,
          },
        ],
      });

    const locales = await ws.getLocales();
    expect(locales).to.deep.equal({
      data: [{
        name: 'Greek',
        code: 'el',
        localized_name: 'Ελληνικά',
        rtl: false,
      }],
    });
  });

  it('translate performs translation', async () => {
    nock(ws.apiHost)
      .post('/i18next/translate', {
        message: 'Hello',
        sourceLocale: 'en-US',
        targetLocale: 'fr-FR',
        tone: 'professional',
        industry: 'general',
      })
      .reply(200, { data: 'Bonjour' });

    const result = await ws.translate('Hello', 'en-US', 'fr-FR', 'professional', 'general');
    expect(result).to.deep.equal({ data: 'Bonjour' });
  });

  it('t function performs translation', async () => {
    nock(ws.apiHost)
      .post('/i18next/translate', {
        message: 'Hello',
        sourceLocale: 'en-US',
        targetLocale: 'fr-FR',
        tone: 'professional',
        industry: 'automotive',
      })
      .reply(200, { data: 'Bonjour' });

    const result = await t('Hello', { targetLocale: 'fr-FR' });
    expect(result).to.equal('Bonjour');
  });

  it('handles errors correctly', async () => {
    nock(ws.apiHost)
      .get('/context/custom-words')
      .reply(500, 'Internal Server Error');

    try {
      await ws.getCustomWords();
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).to.include('HTTP 500');
    }
  });

  // Additional tests for new methods

  it('getContextLibrary fetches context library', async () => {
    nock(ws.apiHost)
      .get('/context/context-library')
      .query({ tenantClientId: 'test-tenant' })
      .reply(200, { data: 'context library data' });

    const result = await ws.getContextLibrary();
    expect(result).to.deep.equal({ data: 'context library data' });
  });

  it('createCustomWord creates a custom word', async () => {
    nock(ws.apiHost)
      .post('/context/custom-words', {
        originalTerm: 'original',
        customTerm: 'custom',
        locale: 'en-US',
      })
      .reply(200, { data: 'created custom word' });

    const result = await ws.createCustomWord('original', 'custom', 'en-US');
    expect(result).to.deep.equal({ data: 'created custom word' });
  });

  // Add more tests for other new methods...
});
