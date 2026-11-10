
const config = require('../config');

module.exports = {
  run: async ({ sock, from, msg }) => {
    const p = config.prefix;

    const text = `
╭━━━━━━━━━━━━━━━━━━━━╮
       👑 *${config.botName.toUpperCase()}* 👑
╰━━━━━━━━━━━━━━━━━━━━╯

       ✨ *LUXURY MENU* ✨

┏━━━━━━━━━━━━━━━━━━━━┓
┃  👑 *BOT INFORMATION*
┣━━━━━━━━━━━━━━━━━━━━┫
┃  ▸ Bot   : ${config.botName}
┃  ▸ Owner : ${config.owner}
┃  ▸ Prefix: ${p}
┗━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━┓
┃  ⚡ *GENERAL COMMANDS*
┣━━━━━━━━━━━━━━━━━━━━┫
┃  ${p}menu  - Show menu
┃  ${p}ping  - Check bot speed
┃  ${p}owner - Owner contact
┗━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━┓
┃  📥 *DOWNLOAD COMMANDS*
┣━━━━━━━━━━━━━━━━━━━━┫
┃  ${p}song <name> - Search song
┃  ${p}yt <link>    - YouTube
┃  ${p}fb <link>    - Facebook
┃  ${p}tt <link>    - TikTok
┗━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━┓
┃  🛠️ *UTILITY COMMANDS*
┣━━━━━━━━━━━━━━━━━━━━┫
┃  ${p}api <endpoint> - API request
┗━━━━━━━━━━━━━━━━━━━━┛

       ✦ *POWERED BY ${config.owner.toUpperCase()}* ✦
          💛 *THANK YOU FOR USING ${config.botName.toUpperCase()}* 💛
`;

    await sock.sendMessage(from, { text }, { quoted: msg });
  },
};
