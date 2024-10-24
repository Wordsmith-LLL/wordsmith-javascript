/* globals describe */
const { expect, test } = require('@oclif/core');

describe('invalidate command', () => {
  const apiHost = process.env.NODE_ENV === 'production' ? 'https://api.wordsmith.is' : 'http://localhost:3000';

  test
    .nock(apiHost, (api) => api
      .post('/invalidate')
      .reply(200, {
        data: {
          status: 'success',
          token: 't',
          count: 5,
        },
      }))
    .stdout()
    .command(['invalidate', '--token=t'])
    .it('invalidates content', (ctx) => {
      expect(ctx.stdout).to.contain('5 records invalidated');
    });

  test
    .nock(apiHost, (api) => api
      .post('/invalidate')
      .query({ purge: 'true' })
      .reply(200, {
        data: {
          status: 'success',
          token: 't',
          count: 10,
        },
      }))
    .stdout()
    .command(['invalidate', '--purge', '--token=t'])
    .it('invalidates and purges content', (ctx) => {
      expect(ctx.stdout).to.contain('10 records invalidated');
    });

  test
    .nock(apiHost, (api) => api
      .post('/invalidate')
      .reply(403))
    .stdout()
    .stderr()
    .command(['invalidate', '--token=t'])
    .exit(2)
    .it('handles invalidate error', (ctx) => {
      expect(ctx.stdout).to.contain('Invalidating cache... Failed');
    });

  test
    .stdout()
    .command(['invalidate'])
    .exit(2)
    .it('fails when API token is missing', (ctx) => {
      expect(ctx.stdout).to.contain('Cannot invalidate cache, API token is missing');
    });

  test
    .nock('https://custom-api.example.com', (api) => api
      .post('/invalidate')
      .reply(200, {
        data: {
          status: 'success',
          token: 't',
          count: 3,
        },
      }))
    .stdout()
    .command(['invalidate', '--token=t', '--api-host=https://custom-api.example.com'])
    .it('uses custom API host', (ctx) => {
      expect(ctx.stdout).to.contain('3 records invalidated');
    });
});