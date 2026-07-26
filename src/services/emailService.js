const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = require('../config/env');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

async function sendAlert(email, subject, html) {
  try {
    await transporter.sendMail({ from: EMAIL_FROM, to: email, subject, html });
    logger.info(`Alert sent to ${email}`);
  } catch (err) {
    logger.error(`Email error: ${err.message}`);
  }
}

async function sendDailyReport(userEmail, data) {
  const html = `<h1>Daily Product Alert</h1><p>${data.keyword} - Scores: ${JSON.stringify(data.scores)}</p>`;
  await sendAlert(userEmail, 'New Winning Product Found', html);
}
module.exports = { sendAlert, sendDailyReport };
