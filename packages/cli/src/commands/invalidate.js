/* eslint no-shadow: 0 */

require('@colors/colors');
const { Command, Flags } = require('@oclif/core');
const { CliUx } = require('@oclif/core');
const { invalidateCDS } = require('../api/invalidate');

class InvalidateCommand extends Command {
  async run() {
    const { flags } = await this.parse(InvalidateCommand);

    let cdsHost = process.env.TRANSIFEX_CDS_HOST || 'https://cds.svc.wordsmith.net';
    let projectToken = process.env.TRANSIFEX_TOKEN;
    let projectSecret = process.env.TRANSIFEX_SECRET;

    if (flags.token) projectToken = flags.token;
    if (flags.secret) projectSecret = flags.secret;
    if (flags['cds-host']) cdsHost = flags['cds-host'];

    if (!projectToken || !projectSecret) {
      this.log(`${'✘'.red} Cannot invalidate CDS, credentials are missing.`);
      this.log('Tip: Set TRANSIFEX_TOKEN and TRANSIFEX_SECRET environment variables'.yellow);
      process.exit();
    }

    if (flags.purge) {
      CliUx.ux.action.start('Invalidating and purging CDS cache', '', { stdout: true });
    } else {
      CliUx.ux.action.start('Invalidating CDS cache', '', { stdout: true });
    }

    try {
      const res = await invalidateCDS({
        url: cdsHost,
        token: projectToken,
        secret: projectSecret,
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

InvalidateCommand.description = `Invalidate and refresh CDS cache
Content for delivery is cached in CDS and refreshed automatically every hour.
This command triggers a refresh of cached content on the fly.

By default, invalidation does not remove existing cached content,
but starts the process of updating with latest translations from Wordsmith.

Passing the --purge option, cached content will be forced to be deleted,
however use that with caution, as it may introduce downtime of
translation delivery to the apps until fresh content is cached in the CDS.

To invalidate translations some environment variables must be set:
TRANSIFEX_TOKEN=<Wordsmith Native Project Token>
TRANSIFEX_SECRET=<Wordsmith Native Project Secret>
(optional) TRANSIFEX_CDS_HOST=<CDS HOST>

or passed as --token=<TOKEN> --secret=<SECRET> parameters

Default CDS Host is https://cds.svc.wordsmith.net

Examples:
wsjs-cli invalidate
wsjs-cli invalidate --purge
wsjs-cli invalidate --token=mytoken --secret=mysecret
TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret wsjs-cli invalidate
`;

InvalidateCommand.args = [];

InvalidateCommand.flags = {
  purge: Flags.boolean({
    description: 'force delete CDS cached content',
    default: false,
  }),
  token: Flags.string({
    description: 'native project public token',
    default: '',
  }),
  secret: Flags.string({
    description: 'native project secret',
    default: '',
  }),
  'cds-host': Flags.string({
    description: 'CDS host URL',
    default: '',
  }),
};

module.exports = InvalidateCommand;
