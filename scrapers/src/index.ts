import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import { scrapeRimiPrices } from './jobs/prices/rimi.js';
import { scrapeMaximaPrices } from './jobs/prices/maxima.js';
import { scrapeBarboraPrices } from './jobs/prices/barbora.js';
import { scrapeOpenSourceRecipes } from './jobs/recipes/open_source.js';

console.log('Scrapers service starting...');

// Weekly price updates (Sunday 03:00)
cron.schedule('0 3 * * 0', async () => {
  console.log('[Cron] Updating prices...');
  await scrapeRimiPrices();
  await scrapeMaximaPrices();
  await scrapeBarboraPrices();
  console.log('[Cron] Price update finished');
});

// Weekly new recipes (Monday 04:00)
cron.schedule('0 4 * * 1', async () => {
  console.log('[Cron] Scraping open-source recipes...');
  await scrapeOpenSourceRecipes();
  console.log('[Cron] Recipe scraping finished');
});

// Run immediately on start to get initial data
(async () => {
  console.log('[Warmup] Running initial price updates...');
  try {
    await scrapeRimiPrices();
    await scrapeMaximaPrices();
    await scrapeBarboraPrices();
    console.log('[Warmup] Initial price updates completed');
  } catch (e) {
    console.error('[Warmup] Price warmup failed', e);
  }
})();