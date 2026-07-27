class PricingEngine {
  async recommend(rawData, scores) {
    const compAvg = rawData.amazonScraper?.avgPrice || 25;
    const cheapest = this.getCheapestSupplier(rawData.scrapingBee);
    
    let recommended = 20;
    let markup = 0;
    let margin = 0;

    if (cheapest.price > 0) {
      const targetMargin = 0.30;
      recommended = cheapest.price / (1 - targetMargin);
      recommended = Math.round(recommended * 2) / 2;
      
      markup = ((recommended - cheapest.price) / cheapest.price * 100);
      margin = ((recommended - cheapest.price) / recommended * 100);
    }

    return {
      recommended,
      competitorAverage: compAvg,
      cheapestSupplierPrice: cheapest.price,
      markup: isFinite(markup) ? markup.toFixed(0) + '%' : 'N/A',
      margin: isFinite(margin) ? margin.toFixed(0) + '%' : 'N/A'
    };
  }

  getCheapestSupplier(supplierData) {
    if (!supplierData) return { price: 0 };
    const prices = Object.values(supplierData).filter(v => typeof v === 'object' && v.price).map(v => v.price);
    return { price: prices.length ? Math.min(...prices) : 0 };
  }
}
module.exports = new PricingEngine();
