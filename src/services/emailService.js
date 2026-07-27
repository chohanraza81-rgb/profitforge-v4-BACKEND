const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = require('../config/env');
const logger = require('../config/logger');

let transporter = null;

// Only create transporter if all credentials exist
if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT) || 587,
      secure: false,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
    logger.info('✅ Email transporter initialized');
  } catch (err) {
    logger.error('❌ Email transporter init error:', err.message);
  }
} else {
  logger.warn('⚠️ Email credentials missing – email service disabled');
}

async function sendAlert(email, subject, html) {
  if (!transporter) {
    logger.warn('📧 Email not sent – transporter not available');
    return;
  }
  try {
    await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: email,
      subject,
      html
    });
    logger.info(`📧 Alert sent to ${email}`);
  } catch (err) {
    logger.error(`❌ Email send error: ${err.message}`);
  }
}

async function sendDailyReport(userEmail, data) {
  const subject = `📊 PROFITFORGE Daily Report: ${data.keyword}`;
  const html = `<h1>PROFITFORGE Daily Report</h1><p>${data.keyword}</p><pre>${JSON.stringify(data.scores, null, 2)}</pre>`;
  await sendAlert(userEmail, subject, html);
}

module.exports = { sendAlert, sendDailyReport };
