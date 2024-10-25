import { expect } from 'chai';
import nock from 'nock';
import { createNativeInstance } from '../src/index';

describe('t function', () => {
  let t;
  let ws;

  beforeEach(() => {
    ws = createNativeInstance();
    t = ws.t.bind(ws);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('translates string', async () => {
    nock(ws.apiHost)
      .post('/i18next/translate')
      .reply(200, { data: 'Hello' });

    expect(await t('Hello')).to.equal('Hello');

    nock(ws.apiHost)
      .post('/i18next/translate')
      .reply(200, { data: 'Hello Joe' });

    expect(await t('Hello {username}', { username: 'Joe' }))
      .to.equal('Hello Joe');
  });

  it('handles variables', async () => {
    nock(ws.apiHost)
      .post('/i18next/translate')
      .reply(200, { data: 'Hello <b>Joe</b>' });

    expect(await t('Hello {username}', { username: '<b>Joe</b>' }))
      .to.equal('Hello <b>Joe</b>');
  });

  it('handles errors', async () => {
    nock(ws.apiHost)
      .post('/i18next/translate')
      .reply(500, 'Internal Server Error');

    try {
      await t('Hello');
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).to.include('HTTP 500');
    }
  });

  it('uses default values when translation fails', async () => {
    nock(ws.apiHost)
      .post('/i18next/translate')
      .reply(200, {}); // Empty response, simulating translation failure

    expect(await t('Hello')).to.equal('Hello');
  });

  it('respects provided options', async () => {
    nock(ws.apiHost)
      .post('/i18next/translate', {
        message: 'Hello',
        sourceLocale: 'en-US',
        targetLocale: 'fr-FR',
        tone: 'casual',
        industry: 'technology',
      })
      .reply(200, { data: 'Salut' });

    expect(await t('Hello', {
      sourceLocale: 'en-US',
      targetLocale: 'fr-FR',
      tone: 'casual',
      industry: 'technology',
    })).to.equal('Salut');
  });

  it('uses default options when not provided', async () => {
    nock(ws.apiHost)
      .post('/i18next/translate', {
        message: 'Hello',
        sourceLocale: 'en-US',
        targetLocale: 'en-US',
        tone: 'professional',
        industry: 'automotive',
      })
      .reply(200, { data: 'Hello' });

    expect(await t('Hello')).to.equal('Hello');
  });

  // Add more tests as needed...
});
