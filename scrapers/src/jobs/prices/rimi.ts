import { updateStorePrices, scrapeSearchLdJson, DEFAULT_QUERIES } from './shared.js';

export async function scrapeRimiPrices(): Promise<void> {
  // Rimi LV search page template
  const template = 'https://www.rimi.lv/e-veikals/lv/meklet?q={query}';
  const products = await scrapeSearchLdJson('Rimi', template, DEFAULT_QUERIES);
  if (products.length > 0) {
    await updateStorePrices('Rimi', products);
  }
}