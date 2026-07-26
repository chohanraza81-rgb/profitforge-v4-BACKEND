const Groq = require('groq-sdk');
const { GROQ_API_KEY } = require('../config/env');
const groq = new Groq({ apiKey: GROQ_API_KEY });

async function predict(rawData) {
  try {
    const trends = rawData.serpApi?.interestOverTime || [];
    const prompt = `Given trend data: ${JSON.stringify(trends)}, predict next 3 months interest scores. Return JSON array of 3 numbers.`;
    const chat = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.3,
    });
    const forecast = JSON.parse(chat.choices[0].message.content.trim() || '[0,0,0]');
    return { forecast, source: 'Groq AI' };
  } catch {
    return { forecast: [0,0,0], source: 'Fallback' };
  }
}
module.exports = { predict };
