
const config = require('../config');

module.exports = {
  run: async ({ sock, from, msg }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${config.owner}
TEL;type=CELL;waid=${config.ownerNumber}:+${config.ownerNumber}
END:VCARD`;

    await sock.sendMessage(
      from,
      {
        contacts: {
          displayName: config.owner,
          contacts: [{ vcard }]
        }
      },
      { quoted: msg }
    );
  },
};
