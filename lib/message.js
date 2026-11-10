
function unwrap(message) {
  if (!message) return {};

  return (
    message.ephemeralMessage?.message ||
    message.viewOnceMessageV2?.message ||
    message.editedMessage?.message ||
    message
  );
}

function getText(message) {
  const m = unwrap(message);

  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    ''
  );
}

function getContentType(message) {
  const m = unwrap(message);

  return Object.keys(m || {})[0] || 'unknown';
}

module.exports = { getText, getContentType };
