/* globals describe */
const { expect, test } = require('@oclif/test');

describe('pull command', () => {
  const apiHost = process.env.NODE_ENV === 'production' ? 'https://api.wordsmith.is' : 'http://localhost:3000';

  test
    .nock(apiHost, (api) => api
      .get('/languages')
      .reply(200, {
        data: [{
          code: 'en',
          name: 'English',
          localized_name: 'English',
          rtl: false,
        }],
        meta: { source_lang_code: 'en' },
      }))
    .nock(apiHost, (api) => api
      .get('/content/en')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '--token=t'])
    .it('pulls content', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock(apiHost, (api) => api
      .get('/content/fr')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '-l=fr', '--token=t'])
    .it('pulls content with locale filter', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock(apiHost, (api) => api
      .get('/content/fr?filter[tags]=atag')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '-l=fr', '--filter-tags=atag', '--token=t'])
    .it('pulls content with tags filter', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock(apiHost, (api) => api
      .get('/content/fr?filter[status]=reviewed')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '-l=fr', '--filter-status=reviewed', '--token=t'])
    .it('pulls content with status filter', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock(apiHost, (api) => api
      .get('/content/fr?filter[tags]=atag&filter[status]=reviewed')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '-l=fr', '--filter-status=reviewed', '--filter-tags=atag', '--token=t'])
    .it('pulls content with status & tags filter', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock(apiHost, (api) => api
      .get('/languages')
      .reply(403))
    .stdout()
    .stderr()
    .command(['pull', '--token=t'])
    .exit(2)
    .it('handles pull error', (ctx) => {
      expect(ctx.stdout).to.contain('Failed');
    });

  test
    .stdout()
    .command(['pull'])
    .exit(2)
    .it('fails when API token is missing', (ctx) => {
      expect(ctx.stdout).to.contain('Cannot pull content, API token is missing');
    });

  test
    .nock('https://custom-api.example.com', (api) => api
      .get('/languages')
      .reply(200, {
        data: [{
          code: 'en',
          name: 'English',
          localized_name: 'English',
          rtl: false,
        }],
        meta: { source_lang_code: 'en' },
      }))
    .nock('https://custom-api.example.com', (api) => api
      .get('/content/en')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '--token=t', '--api-host=https://custom-api.example.com'])
    .it('uses custom API host', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });
});
