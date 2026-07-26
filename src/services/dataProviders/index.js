const serpApi = require('./serpApi');
const rapidApi = require('./rapidApi');
const apify = require('./apify');
const scrapingBee = require('./scrapingBee');
const shopify = require('./shopify');
const googleShopping = require('./googleShopping');
const ebay = require('./ebay');
const etsy = require('./etsy');

// Each provider must expose a `fetch(keyword)` method that returns data or null.
module.exports = {
  serpApi,
  rapidApi,
  apify,
  scrapingBee,
  shopify,
  googleShopping,
  ebay,
  etsy
};
