
module.exports = {
  run: async ({ sock, from, msg }) => {
    const start = Date.now();

    const sent = await sock.sendMessage(
      from,
      { text: 'Pinging...' },
      { quoted: msg }
    );

    const ms = Date.now() - start;

    await sock.sendMessage(
      from,
      { text: `Pong! ${ms} ms` },
      { quoted: sent }
    );
  },
};
