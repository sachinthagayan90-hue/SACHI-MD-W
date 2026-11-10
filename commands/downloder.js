
const axios = require('axios');
const config = require('../config');

async function download(sock, msg, from, link, endpoint, label) {
  if (!link || !/^https?:\/\//i.test(link)) {
    return sock.sendMessage(
      from,
      { text: `Usage: .${label} <link>` },
      { quoted: msg }
    );
  }

  const { data } = await axios.get(
    `${config.apiBase}/${endpoint}`,
    {
      params: { url: link },
      timeout: config.requestTimeout,
    }
  );

  if (!data?.url) {
    return sock.sendMessage(
      from,
      { text: 'Could not download this link.' },
      { quoted: msg }
    );
  }

  const isVideo = data.type !== 'audio';

  const payload = isVideo
    ? { video: { url: data.url }, caption: data.title || '' }
    : { audio: { url: data.url }, mimetype: 'audio/mpeg' };

  await sock.sendMessage(from, payload, { quoted: msg });
}

module.exports = {
  facebook: {
    run: ({ sock, from, msg, args }) =>
      download(sock, msg, from, args[0], 'facebook', 'fb'),
  },

  youtube: {
    run: ({ sock, from, msg, args }) =>
      download(sock, msg, from, args[0], 'youtube', 'yt'),
  },

  tiktok: {
    run: ({ sock, from, msg, args }) =>
      download(sock, msg, from, args[0], 'tiktok', 'tt'),
  },
};
