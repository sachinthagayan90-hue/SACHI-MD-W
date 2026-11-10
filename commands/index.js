
const menu = require('./menu');
const ping = require('./ping');
const downloader = require('./downloader');
const song = require('./song');
const api = require('./api');
const owner = require('./owner');

const commands = {
  menu,
  ping,
  owner,
  api,
  song,
  fb: downloader.facebook,
  facebook: downloader.facebook,
  yt: downloader.youtube,
  youtube: downloader.youtube,
  tt: downloader.tiktok,
  tiktok: downloader.tiktok,
};

async function handleCommand(ctx) {
  const handler = commands[ctx.command];

  if (!handler) return;

  try {
    await handler.run(ctx);
  } catch (err) {
    console.error(`Command ${ctx.command} failed:`, err.message);

    await ctx.sock.sendMessage(
      ctx.from,
      { text: 'Something went wrong. Please try again.' },
      { quoted: ctx.msg }
    );
  }
}

module.exports = { handleCommand, commands };
