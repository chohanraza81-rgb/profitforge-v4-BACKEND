const serpApi = require('./serpApi');
const apify = require('./apify');
const scrapingBee = require('./scrapingBee');
const amazonScraper = require('./amazonScraper');  // ✅ New
const shopify = require('./shopify');
const googleShopping = require('./googleShopping');
const ebay = require('./ebay');
const etsy = require('./etsy');

module.exports = {
  serpApi,
  apify,
  scrapingBee,
  amazonScraper,    // ✅ New (replaces rapidApi)
  shopify,
  googleShopping,
  ebay,
  etsy
};
