const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = require('../config/env');
const logger = require('../config/logger');

const transporter = nodemailer.createTransporter({...}); // as before

async function sendAlert(email, subject, html) { ... }
async function sendDailyReport(userEmail, data) { ... }
module.exports = { sendAlert, sendDailyReport };
