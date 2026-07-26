const Groq = require('groq-sdk');
const { GROQ_API_KEY } = require('../config/env');
const groq = new Groq({ apiKey: GROQ_API_KEY });

class ScoringEngine {
  async calculate(rawData) {
    const scores = {};

    // Market Heat
    const avgInterest = rawData.serpApi?.avgInterest || 0;
    scores.marketHeat = await this.enhanceScore('marketHeat', Math.min((avgInterest/100)*10, 10), rawData);

    // Profit Margin
    const compPrice = rawData.rapidApi?.avgPrice || 0;
    const suppPrice = this.getLowestPrice(rawData.scrapingBee);
    const rawMargin = compPrice > 0 ? Math.min(Math.max(((compPrice - suppPrice) / compPrice) * 10, 0), 10) : 5;
    scores.profitMargin = await this.enhanceScore('profitMargin', rawMargin, rawData);

    // Ad Strength
    const fbAds = rawData.apify?.ads || [];
    const avgEng = fbAds.reduce((acc, a) => acc + (a.engagement||0), 0) / (fbAds.length||1);
    scores.adStrength = await this.enhanceScore('adStrength', Math.min((avgEng/100)*10, 10), rawData);

    // Urgency (trend change)
    const trends = rawData.serpApi?.interestOverTime || [];
    let urgency = 5;
    if (trends.length > 1) {
      const last = trends[trends.length-1].values[0]?.extracted_value || 0;
      const first = trends[0].values[0]?.extracted_value || 1;
      urgency = Math.min(Math.max(((last - first) / first) * 5, 0), 10);
    }
    scores.urgency = await this.enhanceScore('urgency', urgency, rawData);

    // Viral Score
    const views = rawData.rapidApi?.totalViews || 0;
    scores.viralScore = await this.enhanceScore('viralScore', Math.min((views/1000000)*10, 10), rawData);

    scores.confidence = this.confidenceLevel(rawData);
    return scores;
  }

  async enhanceScore(metric, rawValue, rawData) {
    try {
      const prompt = `Given raw score ${rawValue} for '${metric}' and market data: ${JSON.stringify(rawData)}, return refined score 0-10 with one decimal. Only output number.`;
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
    const total = Object.keys(rawData).length;
    return { level: active === total ? 'HIGH' : active > total*0.6 ? 'MEDIUM' : 'LOW', active, total };
  }
}
module.exports = new ScoringEngine();
