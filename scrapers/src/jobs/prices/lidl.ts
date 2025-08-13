import { updateStorePrices } from './shared.js';

export async function scrapeLidlPrices(): Promise<void> {
  const products = [
    { name: 'Potatoes 2kg', unit: 'g', sizeValue: 2000, sizeUnit: 'g', priceCents: 179 },
    { name: 'Eggs 10pcs', unit: 'pcs', sizeValue: 10, sizeUnit: 'pcs', priceCents: 219 },
    { name: 'Sunflower Oil 1L', unit: 'ml', sizeValue: 1000, sizeUnit: 'ml', priceCents: 299 },
    { name: 'Sugar 1kg', unit: 'g', sizeValue: 1000, sizeUnit: 'g', priceCents: 89 },
    { name: 'Salt 1kg', unit: 'g', sizeValue: 1000, sizeUnit: 'g', priceCents: 49 }
  ];
  await updateStorePrices('Lidl', products);
}