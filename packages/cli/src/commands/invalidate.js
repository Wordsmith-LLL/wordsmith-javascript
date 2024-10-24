/* eslint no-shadow: 0 */

require('@colors/colors');
const { Command, Flags } = require('@oclif/core');
const { CliUx } = require('@oclif/core');
const { invalidateCache } = require('../api/invalidate');

class InvalidateCommand extends Command {
  async run() {
    const { flags } = await this.parse(InvalidateCommand);

    let apiHost = process.env.NODE_ENV === 'production' ? 'https://api.wordsmith.is' : 'http://localhost:3000';
    let apiToken = process.env.WORDSMITH_API_TOKEN;

    if (flags.token) apiToken = flags.token;
    if (flags['api-host']) apiHost = flags['api-host'];

    if (!apiToken) {
      this.log(`${'✘'.red} Cannot invalidate cache, API token is missing.`);
      this.log('Tip: Set WORDSMITH_API_TOKEN environment variable'.yellow);
      process.exit();
    }

    if (flags.purge) {
      CliUx.ux.action.start('Invalidating and purging cache', '', { stdout: true });
    } else {
      CliUx.ux.action.start('Invalidating cache', '', { stdout: true });
    }

    try {
      const res = await invalidateCache({
        url: apiHost,
        token: apiToken,
        purge: flags.purge,
      });
      CliUx.ux.action.stop('Success'.green);
      this.log(`${(res.data.count || 0).toString().green} records invalidated`);
      this.log('Note: It might take a few minutes for fresh content to be available'.yellow);
    } catch (err) {
      CliUx.ux.action.stop('Failed'.red);
      this.error(err);
    }
  }
}

InvalidateCommand.description = `Invalidate and refresh cache
Content for delivery is cached and refreshed automatically every hour.
This command triggers a refresh of cached content on the fly.

By default, invalidation does not remove existing cached content,
but starts the process of updating with latest translations from Wordsmith.

Passing the --purge option, cached content will be forced to be deleted,
however use that with caution, as it may introduce downtime of
translation delivery to the apps until fresh content is cached.

To invalidate translations, set the WORDSMITH_API_TOKEN environment variable
or pass it as --token=<TOKEN> parameter.

The API host is determined by the NODE_ENV environment variable:
- Production: https://api.wordsmith.is
- Development: http://localhost:3000

Examples:
wsjs-cli invalidate
wsjs-cli invalidate --purge
wsjs-cli invalidate --token=myapitoken
WORDSMITH_API_TOKEN=myapitoken wsjs-cli invalidate
`;

InvalidateCommand.args = [];

InvalidateCommand.flags = {
  purge: Flags.boolean({
    description: 'force delete cached content',
    default: false,
  }),
  token: Flags.string({
    description: 'Wordsmith API token',
    default: '',
  }),
  'api-host': Flags.string({
    description: 'API host URL',
    default: '',
  }),
};

module.exports = InvalidateCommand;