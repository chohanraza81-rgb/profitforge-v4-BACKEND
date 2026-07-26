// helpers.js
module.exports = {
  formatCurrency: (num) => `$${num.toFixed(2)}`,
  round: (num, decimals=1) => Math.round(num * 10**decimals) / 10**decimals
};
// validators.js
const { z } = require('zod');
const keywordSchema = z.string().min(1).max(100);
module.exports = { keywordSchema };
