import { updateStorePrices, scrapeSearchLdJson, DEFAULT_QUERIES } from './shared.js';

export async function scrapeMaximaPrices(): Promise<void> {
  // Barbora LV is part of Maxima group and exposes product data online
  const template = 'https://www.barbora.lv/meklet?q={query}';
  const products = await scrapeSearchLdJson('Maxima', template, DEFAULT_QUERIES);
  if (products.length > 0) {
    await updateStorePrices('Maxima', products);
  }
}