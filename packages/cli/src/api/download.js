const axios = require('axios');
const { version } = require('../../package.json');
const { sleep } = require('./utils');

/**
 * Download languages
 *
 * @param {*} { apiHost, token, secret }
 * @return {Promise}
 */
async function downloadLanguages({ apiHost, token, secret }) {
  let response;
  let lastResponseStatus = 202;
  while (lastResponseStatus === 202) {
    /* eslint-disable no-await-in-loop */
    response = await axios.get(`${apiHost}/languages`, {
      headers: {
        Authorization: `Bearer ${token}:${secret}`,
        'Accept-version': 'v2',
        'Content-Type': 'application/json;charset=utf-8',
        'X-NATIVE-SDK': `wsjs/cli/${version}`,
      },
    });
    lastResponseStatus = response.status;
    if (lastResponseStatus === 202) {
      await sleep(1000);
    }
    /* eslint-enable no-await-in-loop */
  }

  return response.data;
}

/**
 * Download phrases
 *
 * @param {*} {
 *   apiHost, locale, filterTags, filterStatus, token, secret,
 * }
 * @return {Promise}
 */
async function downloadPhrases({
  apiHost, locale, filterTags, filterStatus, token, secret,
}) {
  let response;
  let lastResponseStatus = 202;
  while (lastResponseStatus === 202) {
    let url = `${apiHost}/content/${locale}`;

    const getOptions = [];
    if (filterTags) {
      getOptions.push(`filter[tags]=${filterTags}`);
    }
    if (filterStatus) {
      getOptions.push(`filter[status]=${filterStatus}`);
    }
    if (getOptions.length) {
      url = `${url}?${getOptions.join('&')}`;
    }

    /* eslint-disable no-await-in-loop */
    response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}:${secret}`,
        'Accept-version': 'v2',
        'Content-Type': 'application/json;charset=utf-8',
        'X-NATIVE-SDK': `wsjs/cli/${version}`,
      },
    });
    lastResponseStatus = response.status;
    if (lastResponseStatus === 202) {
      await sleep(1000);
    }
    /* eslint-enable no-await-in-loop */
  }

  return response.data;
}

module.exports = {
  downloadPhrases,
  downloadLanguages,
};
