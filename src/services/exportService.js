const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { Parser } = require('json2csv');
const PptxGenJS = require('pptxgenjs');
const { Client } = require('@notionhq/client');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { NOTION_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = require('../config/env');

// --- PDF ---
async function generatePDF(data, outputPath) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  doc.fontSize(24).text('PROFITFORGE v4.0 Analysis', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Keyword: ${data.keyword}`);
  doc.text(`Date: ${data.timestamp}`);
  doc.moveDown();
  doc.fontSize(16).text('Scores');
  for (const [key, score] of Object.entries(data.scores)) {
    if (key === 'confidence') continue;
    doc.text(`${key}: ${score.value.toFixed(1)}/10 (${score.source})`);
  }
  doc.end();
  return new Promise(resolve => stream.on('finish', resolve));
}

// --- DOCX ---
async function generateDOCX(data, outputPath) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'PROFITFORGE v4.0 Analysis', bold: true, size: 32 })] }),
        new Paragraph({ children: [new TextRun({ text: `Keyword: ${data.keyword}` })] }),
        new Paragraph({ children: [new TextRun({ text: `Date: ${data.timestamp}` })] }),
        new Paragraph({ children: [new TextRun({ text: 'Scores', bold: true, size: 24 })] }),
        ...Object.entries(data.scores).filter(([k]) => k !== 'confidence').map(([key, score]) =>
          new Paragraph({ children: [new TextRun({ text: `${key}: ${score.value.toFixed(1)}/10 (${score.source})` })] })
        )
      ]
    }]
  });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

// --- CSV ---
async function generateCSV(data, outputPath) {
  const fields = ['metric', 'value', 'source'];
  const rows = Object.entries(data.scores).filter(([k]) => k !== 'confidence').map(([key, score]) => ({
    metric: key,
    value: score.value,
    source: score.source
  }));
  const parser = new Parser({ fields });
  const csv = parser.parse(rows);
  fs.writeFileSync(outputPath, csv);
}

// --- JSON ---
async function generateJSON(data, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
}

// --- HTML ---
async function generateHTML(data, outputPath) {
  const html = `
  <html><head><title>PROFITFORGE Report</title><style>body { font-family: Inter, sans-serif; background: #05050A; color: #fff; }</style></head>
  <body><h1>PROFITFORGE v4.0</h1><h2>${data.keyword}</h2><p>${data.timestamp}</p>
  <ul>${Object.entries(data.scores).filter(([k]) => k !== 'confidence').map(([k, v]) => `<li>${k}: ${v.value.toFixed(1)}/10 (${v.source})</li>`).join('')}</ul>
  </body></html>`;
  fs.writeFileSync(outputPath, html);
}

// --- Markdown ---
async function generateMarkdown(data, outputPath) {
  let md = `# PROFITFORGE v4.0 — Analysis Report\n\n`;
  md += `**Keyword:** ${data.keyword}\n`;
  md += `**Date:** ${data.timestamp}\n\n`;
  md += `## Scores\n`;
  for (const [key, score] of Object.entries(data.scores)) {
    if (key === 'confidence') continue;
    md += `- ${key}: ${score.value.toFixed(1)}/10 (${score.source})\n`;
  }
  fs.writeFileSync(outputPath, md);
}

// --- PPTX ---
async function generatePPTX(data, outputPath) {
  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();
  slide.addText('PROFITFORGE v4.0', { x: 0, y: 0, w: '100%', h: 1, fontSize: 36, color: '363636' });
  slide.addText(`Keyword: ${data.keyword}`, { x: 0, y: 1, w: '100%', h: 0.5, fontSize: 18 });
  slide.addText(`Date: ${data.timestamp}`, { x: 0, y: 1.5, w: '100%', h: 0.5, fontSize: 18 });
  let yPos = 2.5;
  for (const [key, score] of Object.entries(data.scores)) {
    if (key === 'confidence') continue;
    slide.addText(`${key}: ${score.value.toFixed(1)}/10`, { x: 0, y: yPos, w: '100%', h: 0.5, fontSize: 16 });
    yPos += 0.5;
  }
  await pptx.writeFile({ fileName: outputPath });
}

// --- Notion ---
async function generateNotion(data, notionPageId) {
  const notion = new Client({ auth: NOTION_API_KEY });
  const response = await notion.pages.create({
    parent: { page_id: notionPageId },
    properties: { title: { title: [{ text: { content: `PROFITFORGE: ${data.keyword}` } }] } },
    children: [
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: `Analysis Date: ${data.timestamp}` } }] } },
      ...Object.entries(data.scores).filter(([k]) => k !== 'confidence').map(([key, score]) => ({
        object: 'block', type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: `${key}: ${score.value.toFixed(1)}/10 (${score.source})` } }] }
      }))
    ]
  });
  return response;
}

// --- Google Sheets ---
async function generateGoogleSheets(data, authClient) {
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const spreadsheet = await sheets.spreadsheets.create({
    resource: { properties: { title: `PROFITFORGE - ${data.keyword}` } }
  });
  const spreadsheetId = spreadsheet.data.spreadsheetId;
  const rows = [['Metric', 'Value', 'Source']];
  for (const [key, score] of Object.entries(data.scores)) {
    if (key === 'confidence') continue;
    rows.push([key, score.value.toFixed(1), score.source]);
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    resource: { values: rows }
  });
  return spreadsheetId;
}

module.exports = {
  generatePDF,
  generateDOCX,
  generateCSV,
  generateJSON,
  generateHTML,
  generateMarkdown,
  generatePPTX,
  generateNotion,
  generateGoogleSheets
};
