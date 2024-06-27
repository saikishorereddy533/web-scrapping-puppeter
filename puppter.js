const puppeteer = require('puppeteer');
const { Pool } = require('pg');

// Confluence URL and login credentials (not needed in this case)
const confluenceUrl = 'https://confluence.atlassian.com';
const username = ''; // not required for public page
const password = ''; // not required for public page

// PostgreSQL database connection settings
const pgHost = 'your-pg-host';
const pgDatabase = 'your-pg-database';
const pgUsername = 'your-pg-username';
const pgPassword = 'your-pg-password';

async function scrapeConfluence() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the Atlassian Open Source page
  await page.goto(confluenceUrl);

  // Get all HTML content from the page
  const html = await page.content();

  // Close the browser instance
  await browser.close();
}

async function parseHtmlAndStoreInPg(html) {
  // Parse HTML content to extract text
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const textNodes = doc.querySelectorAll('body *');

  let extractedText = '';
  for (const node of textNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      extractedText += node.textContent;
    }
  }

  // Store the extracted text in PostgreSQL
  const pool = new Pool({
    host: pgHost,
    database: pgDatabase,
    user: pgUsername,
    password: pgPassword,
    port: 5432,
  });

  await pool.query(`INSERT INTO your-table-name (text_data) VALUES ($1)`, [extractedText]);

  // Close the PostgreSQL connection
  pool.end();
}

// Run the scraping and parsing functions
scrapeConfluence()
  .then((html) => parseHtmlAndStoreInPg(html))
  .catch((error) => console.error(error));
