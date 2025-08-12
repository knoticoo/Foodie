import { updateStorePrices } from './shared.js';

export async function scrapeMaximaPrices(): Promise<void> {
  const products = [
    { name: 'Potatoes 2kg', unit: 'g', sizeValue: 2000, sizeUnit: 'g', priceCents: 199 },
    { name: 'Eggs 10pcs', unit: 'pcs', sizeValue: 10, sizeUnit: 'pcs', priceCents: 239 },
    { name: 'Pickles 680ml jar', unit: 'ml', sizeValue: 680, sizeUnit: 'ml', priceCents: 279 },
    { name: 'Mayonnaise 250g', unit: 'g', sizeValue: 250, sizeUnit: 'g', priceCents: 129 },
    { name: 'Salt 1kg', unit: 'g', sizeValue: 1000, sizeUnit: 'g', priceCents: 55 },
    { name: 'Black Pepper 40g', unit: 'g', sizeValue: 40, sizeUnit: 'g', priceCents: 129 }
  ];
  await updateStorePrices('Maxima', products);
}