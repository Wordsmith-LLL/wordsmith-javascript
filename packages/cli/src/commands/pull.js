/* eslint-disable no-await-in-loop */
require('@colors/colors');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { Command, Flags } = require('@oclif/core');
const { CliUx } = require('@oclif/core');
const { downloadLanguages, downloadPhrases } = require('../api/download');

class PullCommand extends Command {
  async run() {
    const { flags } = await this.parse(PullCommand);

    let apiHost = process.env.NODE_ENV === 'production' ? 'https://api.wordsmith.is' : 'http://localhost:3000';
    let apiToken = process.env.WORDSMITH_API_TOKEN;

    if (flags.token) apiToken = flags.token;
    if (flags['api-host']) apiHost = flags['api-host'];

    if (!apiToken) {
      this.log(`${'✘'.red} Cannot pull content, API token is missing.`);
      this.log('Tip: Set WORDSMITH_API_TOKEN environment variable'.yellow);
      process.exit();
    }

    try {
      // get source lang
      const params = {
        apiHost,
        token: apiToken,
        filterTags: flags['filter-tags'],
        filterStatus: flags['filter-status'],
        locale: '',
      };
      const locales = [];
      if (flags.locale) {
        locales.push(flags.locale);
      } else {
        CliUx.ux.action.start('Getting available languages', '', { stdout: true });
        const languages = await downloadLanguages(params);
        _.each(languages.data, (entry) => {
          if (entry.code) {
            locales.push(entry.code);
          }
        });
      }
      for (let i = 0; i < locales.length; i += 1) {
        params.locale = locales[i];
        CliUx.ux.action.start(
          `Pulling content for ${params.locale.green} locale (${i + 1} of ${locales.length})`,
          '',
          { stdout: true },
        );
        const { data } = await downloadPhrases(params);
        const json = flags.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        if (flags.folder) {
          fs.writeFileSync(path.join(flags.folder, `${params.locale}.json`), json);
        }
        if (!flags.folder) {
          this.log(json);
        }
      }
      CliUx.ux.action.stop('Done'.green);
    } catch (err) {
      CliUx.ux.action.stop('Failed'.red);
      this.error(err);
    }
  }
}

PullCommand.description = `Pull content from Wordsmith for offline caching
Get content as JSON files, to be used by mobile Javascript SDKs for
offline support or warming up the cache with initial translations.

By default, JSON files are printed in the console,
unless the "-f foldername" parameter is provided. In that case
the JSON files will be downloaded to that folder with the <locale>.json format.

To pull content, set the WORDSMITH_API_TOKEN environment variable
or pass it as --token=<TOKEN> parameter.

The API host is determined by the NODE_ENV environment variable:
- Production: https://api.wordsmith.is
- Development: http://localhost:3000

Examples:
wsjs-cli pull
wsjs-cli pull --pretty
wsjs-cli pull -f languages/
wsjs-cli pull --locale=fr -f .
wsjs-cli pull --filter-tags="foo,bar"
wsjs-cli pull --filter-status="reviewed"
wsjs-cli pull --token=myapitoken
WORDSMITH_API_TOKEN=myapitoken wsjs-cli pull
`;

PullCommand.args = [];

PullCommand.flags = {
  token: Flags.string({
    description: 'Wordsmith API token',
    default: '',
  }),
  folder: Flags.string({
    char: 'f',
    description: 'output as files to folder',
    default: '',
  }),
  locale: Flags.string({
    char: 'l',
    description: 'pull specific language locale code',
    default: '',
  }),
  pretty: Flags.boolean({
    description: 'beautify JSON output',
    default: false,
  }),
  'filter-tags': Flags.string({
    description: 'filter over specific tags',
    default: '',
  }),
  'filter-status': Flags.string({
    description: 'filter over translation status',
    default: '',
    options: ['reviewed', 'proofread', 'finalized'],
  }),
  'api-host': Flags.string({
    description: 'API host URL',
    default: '',
  }),
};

module.exports = PullCommand;
