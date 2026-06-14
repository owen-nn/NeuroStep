const PushToken = require('../models/PushToken');

async function sendPushToAll(title, body, data = {}) {
  const tokens = await PushToken.find().distinct('token');
  if (tokens.length === 0) return;

  const messages = tokens.map((token) => ({
    to:    token,
    sound: 'default',
    title,
    body,
    data,
  }));

  await fetch('https://exp.host/--/api/v2/push/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(messages),
  });
}

module.exports = { sendPushToAll };
