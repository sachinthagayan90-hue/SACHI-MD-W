
const MAX = 5000;
const messages = new Map();

function saveMessage(msg) {
  if (!msg?.key?.id || !msg.message) return;

  messages.set(msg.key.id, {
    key: msg.key,
    message: msg.message,
    time: Date.now()
  });

  if (messages.size > MAX) {
    const oldest = messages.keys().next().value;
    messages.delete(oldest);
  }
}

function getMessage(id) {
  return messages.get(id);
}

module.exports = { saveMessage, getMessage };
