
const axios = require('axios');
const config = require('../config');

module.exports = {
  run: async ({ sock, from, msg, args }) => {
    if (!args.length) {
      return sock.sendMessage(
        from,
        { text: 'Usage: .api <endpoint>' },
        { quoted: msg }
      );
    }

    const url = `${config.apiBase}/${args.join('/')}`;

    const { data } = await axios.get(url, {
      timeout: config.requestTimeout,
      headers: config.apiKey
        ? { Authorization: `Bearer ${config.apiKey}` }
        : {},
    });

    const out =
      typeof data === 'string'
        ? data
        : JSON.stringify(data, null, 2);

    await sock.sendMessage(
      from,
      { text: out.slice(0, 3500) },
      { quoted: msg }
    );
  },
};
