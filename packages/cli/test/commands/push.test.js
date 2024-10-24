/* globals describe */
const { expect, test } = require('@oclif/test');

describe('push command', () => {
  const apiHost = process.env.NODE_ENV === 'production' ? 'https://api.wordsmith.is' : 'http://localhost:3000';

  test
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--fake'])
    .it('extracts simple phrases', (ctx) => {
      expect(ctx.stdout).to.contain('Processed 1 file(s) and found 8 translatable phrases');
      expect(ctx.stdout).to.contain('Content detected in 1 file(s)');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--fake', '-v', '--key-generator=hash'])
    .it('outputs strings on verbose mode with hashed keys', (ctx) => {
      expect(ctx.stdout).to.contain('f2138b2131e064313c369b20006549df: Text 1');
      expect(ctx.stdout).to.contain('5d47152bcd597dd6adbff4884374aaad: Text 2');
      expect(ctx.stdout).to.contain('3cd62915590816fdbf53852e44ee675a: Text 3');
      expect(ctx.stdout).to.contain('33f5afa925f1464280d72d6d9086057c: Text 4');
      expect(ctx.stdout).to.contain('occurrences: ["test/fixtures/simple.js"]');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--fake', '-v'])
    .it('outputs strings on verbose mode', (ctx) => {
      expect(ctx.stdout).to.contain('Text 1');
      expect(ctx.stdout).to.contain('Text 2');
      expect(ctx.stdout).to.contain('Text 3');
      expect(ctx.stdout).to.contain('Text 4');
      expect(ctx.stdout).to.contain('occurrences: ["test/fixtures/simple.js"]');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/', '--fake', '-v', '--key-generator=hash'])
    .it('outputs strings on verbose mode for directory', (ctx) => {
      expect(ctx.stdout).to.contain('f2138b2131e064313c369b20006549df: Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/', '--fake', '-v'])
    .it('outputs strings on verbose mode for directory', (ctx) => {
      expect(ctx.stdout).to.contain('Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/*.js', '--fake', '-v', '--key-generator=hash'])
    .it('outputs strings on verbose mode for glob pattern', (ctx) => {
      expect(ctx.stdout).to.contain('f2138b2131e064313c369b20006549df: Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/*.js', '--fake', '-v'])
    .it('outputs strings on verbose mode for glob pattern', (ctx) => {
      expect(ctx.stdout).to.contain('Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/*.foo', '--fake', '-v', '--key-generator=hash'])
    .it('does not output strings for non-matching files', (ctx) => {
      expect(ctx.stdout).to.not.contain('f2138b2131e064313c369b20006549df: Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/*.foo', '--fake', '-v'])
    .it('does not output strings for non-matching files', (ctx) => {
      expect(ctx.stdout).to.not.contain('Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/tags.js', '--fake', '-v', '--append-tags=custom'])
    .it('append tags', (ctx) => {
      expect(ctx.stdout).to.contain('tags: ["tag1","tag2","custom"]');
      expect(ctx.stdout).to.contain('tags: ["tag2","tag3","custom"]');
      expect(ctx.stdout).to.contain('tags: ["custom"]');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/tags.js', '--fake', '-v', '--with-tags-only=tag1'])
    .it('filters-in tags', (ctx) => {
      expect(ctx.stdout).to.not.contain('tag3');
      expect(ctx.stdout).to.contain('tag1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/tags.js', '--fake', '-v', '--without-tags-only=tag1'])
    .it('filters-out tags', (ctx) => {
      expect(ctx.stdout).to.contain('tag2');
      expect(ctx.stdout).to.contain('tag3');
      expect(ctx.stdout).to.not.contain('tag1');
    });

  test
    .nock(apiHost, (api) => api
      .post('/content')
      .reply(200, {
        data: {
          id: '1',
          links: {
            job: '/jobs/content/1',
          },
        },
      }))
    .nock(apiHost, (api) => api
      .get('/jobs/content/1')
      .reply(200, {
        data: {
          details: {
            created: 2,
            updated: 2,
            skipped: 0,
            deleted: 0,
            failed: 0,
          },
          errors: [],
          status: 'completed',
        },
      }))
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--token=t'])
    .it('pushes content', (ctx) => {
      expect(ctx.stdout).to.contain('Created strings: 2');
      expect(ctx.stdout).to.contain('Updated strings: 2');
    });

  test
    .nock(apiHost, (api) => api
      .post('/content')
      .reply(200, {
        data: {
          id: '1',
          links: {
            job: '/jobs/content/1',
          },
        },
      }))
    .nock(apiHost, (api) => api
      .get('/jobs/content/1')
      .reply(200, {
        data: {
          details: {
            created: 2,
            updated: 2,
            skipped: 0,
            deleted: 0,
            failed: 0,
          },
          errors: [],
          status: 'completed',
        },
      }))
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--dry-run', '--token=t'])
    .it('pushes content with dry-run', (ctx) => {
      expect(ctx.stdout).to.contain('Created strings: 2');
      expect(ctx.stdout).to.contain('Updated strings: 2');
    });

  test
    .nock(apiHost, (api) => api
      .post('/content')
      .reply(403))
    .stdout()
    .stderr()
    .command(['push', 'test/fixtures/simple.js', '--token=t'])
    .exit(2)
    .it('handles push error', (ctx) => {
      expect(ctx.stdout).to.contain('Uploading content to Wordsmith... Failed');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/simple.js'])
    .exit(2)
    .it('fails when API token is missing', (ctx) => {
      expect(ctx.stdout).to.contain('Cannot push content, API token is missing');
    });

  test
    .nock('https://custom-api.example.com', (api) => api
      .post('/content')
      .reply(200, {
        data: {
          id: '1',
          links: {
            job: '/jobs/content/1',
          },
        },
      }))
    .nock('https://custom-api.example.com', (api) => api
      .get('/jobs/content/1')
      .reply(200, {
        data: {
          details: {
            created: 2,
            updated: 2,
            skipped: 0,
            deleted: 0,
            failed: 0,
          },
          errors: [],
          status: 'completed',
        },
      }))
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--token=t', '--api-host=https://custom-api.example.com'])
    .it('uses custom API host', (ctx) => {
      expect(ctx.stdout).to.contain('Created strings: 2');
      expect(ctx.stdout).to.contain('Updated strings: 2');
    });
});
