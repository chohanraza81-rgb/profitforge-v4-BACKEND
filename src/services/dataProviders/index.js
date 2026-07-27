const serpApi = require('./serpApi');
const scrapingBee = require('./scrapingBee');
const amazonScraper = require('./amazonScraper');
// Groq is not a data provider; it's used in scoringEngine

module.exports = {
  serpApi,
  scrapingBee,
  amazonScraper,
};
