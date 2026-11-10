
module.exports = {
  botName: 'Sachintha Bot',
  owner: 'Sachintha',
  prefix: '.',
  ownerNumber: '94700000000',

  get ownerJid() {
    return `${this.ownerNumber}@s.whatsapp.net`;
  },

  sessionDir: './session',
  antiDelete: true,
  antiEdit: true,
  viewOnceToOwner: true,

  apiBase: 'https://api.example.com',
  apiKey: process.env.API_KEY || '',
  requestTimeout: 15000,
};
