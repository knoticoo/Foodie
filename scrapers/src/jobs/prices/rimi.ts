import { updateStorePrices } from './shared.js';

export async function scrapeRimiPrices(): Promise<void> {
  // Placeholder dataset; replace with real scraping logic for Rimi later
  const products = [
    { name: 'Potatoes 1kg', unit: 'g', sizeValue: 1000, sizeUnit: 'g', priceCents: 129 },
    { name: 'Eggs 10pcs', unit: 'pcs', sizeValue: 10, sizeUnit: 'pcs', priceCents: 249 },
    { name: 'Pickles 720ml jar', unit: 'ml', sizeValue: 720, sizeUnit: 'ml', priceCents: 299 },
    { name: 'Mayonnaise 400g', unit: 'g', sizeValue: 400, sizeUnit: 'g', priceCents: 189 },
    { name: 'Salt 1kg', unit: 'g', sizeValue: 1000, sizeUnit: 'g', priceCents: 59 },
    { name: 'Black Pepper 50g', unit: 'g', sizeValue: 50, sizeUnit: 'g', priceCents: 149 }
  ];
  await updateStorePrices('Rimi', products);
}