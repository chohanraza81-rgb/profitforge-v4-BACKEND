const Groq = require('groq-sdk');
const { GROQ_API_KEY } = require('../config/env');
const groq = new Groq({ apiKey: GROQ_API_KEY });

class ScoringEngine {
  async calculate(rawData) {
    const scores = {};

    // MARKET HEAT – from SerpAPI
    const avgInterest = rawData.serpApi?.avgInterest || 0;
    scores.marketHeat = avgInterest ? await this.enhanceScore('marketHeat', Math.min((avgInterest/100)*10, 10), rawData) : { value: null, source: 'No Data' };

    // PROFIT MARGIN – from Amazon + Suppliers
    const compPrice = rawData.amazonScraper?.avgPrice || 0;
    const suppPrice = this.getLowestPrice(rawData.scrapingBee);
    let rawMargin = null;
    if (compPrice > 0 && suppPrice > 0) {
      rawMargin = Math.min(Math.max(((compPrice - suppPrice) / compPrice) * 10, 0), 10);
    }
    scores.profitMargin = rawMargin !== null ? await this.enhanceScore('profitMargin', rawMargin, rawData) : { value: null, source: 'No Data' };

    // AD STRENGTH – removed (Apify not working)
    scores.adStrength = { value: null, source: 'N/A', details: 'Apify not available' };

    // URGENCY – from SerpAPI trends
    const trends = rawData.serpApi?.interestOverTime || [];
    let urgency = null;
    if (trends.length > 1) {
      const last = trends[trends.length-1].values[0]?.extracted_value || 0;
      const first = trends[0].values[0]?.extracted_value || 1;
      urgency = Math.min(Math.max(((last - first) / first) * 5, 0), 10);
    }
    scores.urgency = urgency !== null ? await this.enhanceScore('urgency', urgency, rawData) : { value: null, source: 'No Data' };

    // VIRAL SCORE – removed (no TikTok)
    scores.viralScore = { value: null, source: 'N/A', details: 'TikTok API removed' };

    // CONFIDENCE – based on active providers (only 3)
    scores.confidence = this.confidenceLevel(rawData);
    return scores;
  }

  async enhanceScore(metric, rawValue, rawData) {
    if (rawValue === null || rawValue === undefined) {
      return { value: null, source: 'No Data' };
    }
    try {
      const prompt = `Given raw score ${rawValue} for '${metric}' and market data, return refined score 0-10 with one decimal. Only output number.`;
      const chat = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.3,
      });
      const adjusted = parseFloat(chat.choices[0].message.content.trim()) || rawValue;
      return { value: Math.min(Math.max(adjusted,0),10), source: 'Real Data + Groq AI', details: `Base: ${rawValue.toFixed(1)}` };
    } catch {
      return { value: rawValue, source: 'Real Data' };
    }
  }

  getLowestPrice(supplierData) {
    if (!supplierData) return 0;
    const prices = Object.values(supplierData).filter(v => typeof v === 'object' && v.price).map(v => v.price);
    return prices.length ? Math.min(...prices) : 0;
  }

  confidenceLevel(rawData) {
    const active = Object.values(rawData).filter(v => v !== null).length;
    const total = Object.keys(rawData).length; // should be 3
    return { level: active === total ? 'HIGH' : active > total*0.6 ? 'MEDIUM' : 'LOW', active, total };
  }
}
module.exports = new ScoringEngine();
