class PricingEngine {
  async recommend(rawData, scores) {
    const compAvg = rawData.rapidApi?.avgPrice || 25;
    const cheapest = this.getCheapestSupplier(rawData.scrapingBee);
    const targetMargin = 0.30;
    let recommended = cheapest.price / (1 - targetMargin);
    recommended = Math.round(recommended * 2) / 2;
    return {
      recommended,
      competitorAverage: compAvg,
      cheapestSupplierPrice: cheapest.price,
      markup: ((recommended - cheapest.price) / cheapest.price * 100).toFixed(0)+'%',
      margin: ((recommended - cheapest.price) / recommended * 100).toFixed(0)+'%'
    };
  }
  getCheapestSupplier(supplierData) {
    if (!supplierData) return { price: 0 };
    const prices = Object.values(supplierData).filter(v => typeof v === 'object' && v.price).map(v => v.price);
    return { price: prices.length ? Math.min(...prices) : 0 };
  }
}
module.exports = new PricingEngine();
