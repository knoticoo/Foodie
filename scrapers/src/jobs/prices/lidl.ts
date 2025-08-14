import { updateStorePrices, scrapeSearchLdJson, DEFAULT_QUERIES } from './shared.js';

export async function scrapeLidlPrices(): Promise<void> {
  // Lidl LV often has promotional pages; attempt search URL; fallback if pages differ
  const template = 'https://www.lidl.lv/sviediena?q={query}';
  const products = await scrapeSearchLdJson('Lidl', template, DEFAULT_QUERIES);
  if (products.length > 0) {
    await updateStorePrices('Lidl', products);
  }
}