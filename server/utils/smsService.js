const twilio = require('twilio');

let client;
try {
  if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch {}

exports.sendSMSOTP = async (to, code) => {
  if (!client || !process.env.TWILIO_PHONE) return;
  await client.messages.create({ from: process.env.TWILIO_PHONE, to, body: `Your SkillUp verification code is ${code}` });
};
