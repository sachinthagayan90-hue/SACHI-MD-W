
const axios = require('axios');
const config = require('../config');

module.exports = {
  run: async ({ sock, from, msg, args }) => {
    const query = args.join(' ');

    if (!query) {
      return sock.sendMessage(
        from,
        { text: 'Usage: .song <name>' },
        { quoted: msg }
      );
    }

    const { data } = await axios.get(`${config.apiBase}/song`, {
      params: { q: query },
      timeout: config.requestTimeout,
    });

    if (!data?.audio) {
      return sock.sendMessage(
        from,
        { text: 'Song not found.' },
        { quoted: msg }
      );
    }

    await sock.sendMessage(
      from,
      {
        audio: { url: data.audio },
        mimetype: 'audio/mpeg',
        fileName: `${data.title || query}.mp3`
      },
      { quoted: msg }
    );
  },
};
