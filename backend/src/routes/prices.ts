import { Router } from 'express';

export const pricesRouter = Router();

pricesRouter.get('/cheapest', async (req, res) => {
  const name = String(req.query.name || '').trim();
  const unit = String(req.query.unit || 'g');
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const { findCheapestProduct } = await import('../services/priceService.js');
    const cheapest = await findCheapestProduct(name, unit);
    if (!cheapest) return res.status(404).json({ error: 'No products found' });
    return res.json(cheapest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to lookup cheapest product' });
  }
});