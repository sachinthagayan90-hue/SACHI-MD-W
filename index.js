
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const { handleCommand } = require('./commands');
const store = require('./lib/store');
const { getText, getContentType } = require('./lib/message');

const logger = pino({ level: 'silent' });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    logger,
    printQRInTerminal: false,
    browser: ['Sachintha Bot', 'Chrome', '1.0.0'],
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('Scan this QR code with WhatsApp > Linked devices:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log(`${config.botName} connected as ${sock.user?.id?.split(':')[0] || 'unknown'}`);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;

      console.log('Connection closed. Code:', code);

      if (loggedOut) {
        console.log('Logged out. Delete the session folder and scan again.');
      } else {
        setTimeout(() => startBot().catch(console.error), 3000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') continue;

        store.saveMessage(msg);
        await handleIncoming(sock, msg);
      } catch (err) {
        console.error('Message handler error:', err.message);
      }
    }
  });

  sock.ev.on('messages.update', async (updates) => {
    for (const { key, update } of updates) {
      try {
        const edited = update?.message?.editedMessage || update?.message?.protocolMessage?.editedMessage;

        if (!edited || !key?.id) continue;

        const original = store.getMessage(key.id);
        const newText = getText(edited);
        const oldText = original ? getText(original.message) : '(not cached)';

        if (!config.antiEdit) continue;

        const target = key.remoteJid;
        const sender = key.participant || key.remoteJid;

        await sock.sendMessage(config.ownerJid, {
          text: `*Anti Edit*\nChat: ${target}\nFrom: ${sender}\n\n*Before:* ${oldText}\n*After:* ${newText}`,
        });

        store.saveMessage({ key, message: edited });
      } catch (err) {
        console.error('Anti edit error:', err.message);
      }
    }
  });

  sock.ev.on('messages.update', async (updates) => {
    for (const { key, update } of updates) {
      try {
        const revoke = update?.message?.protocolMessage;

        if (!revoke || revoke.type !== 0 || !revoke.key?.id) continue;
        if (!config.antiDelete) continue;

        const original = store.getMessage(revoke.key.id);
        if (!original) continue;

        const sender = original.key.participant || original.key.remoteJid;
        const text = getText(original.message) || `[${getContentType(original.message)}]`;

        await sock.sendMessage(config.ownerJid, {
          text: `*Anti Delete*\nChat: ${original.key.remoteJid}\nFrom: ${sender}\n\n${text}`,
        });
      } catch (err) {
        console.error('Anti delete error:', err.message);
      }
    }
  });

  return sock;
}

async function handleIncoming(sock, msg) {
  const from = msg.key.remoteJid;
  const text = getText(msg.message).trim();

  const isOwner = msg.key.fromMe || (msg.key.participant || from) === config.ownerJid;

  const viewOnce = msg.message?.viewOnceMessageV2?.message || msg.message?.viewOnceMessage?.message || msg.message?.viewOnceMessageV2Extension?.message;

  if (viewOnce && config.viewOnceToOwner) {
    const type = getContentType(viewOnce);

    const buffer = await downloadMediaMessage(
      { key: msg.key, message: { ...viewOnce } },
      'buffer',
      {},
      { logger, reuploadRequest: sock.updateMediaMessage }
    ).catch(() => null);

    if (buffer) {
      const caption = `*View Once Saved*\nFrom: ${msg.key.participant || from}`;

      if (type === 'imageMessage') {
        await sock.sendMessage(config.ownerJid, { image: buffer, caption });
      } else if (type === 'videoMessage') {
        await sock.sendMessage(config.ownerJid, { video: buffer, caption });
      } else if (type === 'audioMessage') {
        await sock.sendMessage(config.ownerJid, { audio: buffer, ptt: false });
      }
    }

    return;
  }

  if (!text.startsWith(config.prefix)) return;

  const [cmd, ...args] = text.slice(config.prefix.length).trim().split(/\s+/);

  await handleCommand({
    sock,
    msg,
    from,
    isOwner,
    command: cmd.toLowerCase(),
    args,
    text
  });
}

startBot().catch((err) => console.error('Fatal start error:', err));
