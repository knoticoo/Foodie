import { updateStorePrices } from './shared.js';

export async function scrapeBarboraPrices(): Promise<void> {
  const products = [
    { name: 'Potatoes 1.5kg', unit: 'g', sizeValue: 1500, sizeUnit: 'g', priceCents: 169 },
    { name: 'Eggs 12pcs', unit: 'pcs', sizeValue: 12, sizeUnit: 'pcs', priceCents: 289 },
    { name: 'Pickles 720ml jar', unit: 'ml', sizeValue: 720, sizeUnit: 'ml', priceCents: 289 },
    { name: 'Mayonnaise 500g', unit: 'g', sizeValue: 500, sizeUnit: 'g', priceCents: 219 },
    { name: 'Salt 500g', unit: 'g', sizeValue: 500, sizeUnit: 'g', priceCents: 39 },
    { name: 'Black Pepper 50g', unit: 'g', sizeValue: 50, sizeUnit: 'g', priceCents: 139 }
  ];
  await updateStorePrices('Barbora', products);
}