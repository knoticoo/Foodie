import { withClient } from '../../db.js';

export async function scrapeOpenSourceRecipes(): Promise<void> {
  const demos = [
    {
      title: 'Rupjmaize Trifle (Rupjmaizes kārtojums)',
      description: 'Traditional Latvian rye bread dessert layered with whipped cream and berries.',
      images: [],
      steps: [
        'Crumble rye bread into fine crumbs',
        'Whip cream with sugar',
        'Layer bread crumbs, jam, and cream in glasses',
        'Chill and serve with berries'
      ],
      ingredients: [
        { name: 'Rye bread', quantity: 200, unit: 'g' },
        { name: 'Whipping cream', quantity: 300, unit: 'ml' },
        { name: 'Jam', quantity: 150, unit: 'g' }
      ]
    },
    {
      title: 'Grey peas with bacon (Pelēkie zirņi ar speķi)',
      description: 'Classic Latvian winter dish of grey peas with crispy bacon and onions.',
      images: [],
      steps: [
        'Soak peas overnight and boil until tender',
        'Fry bacon with onions',
        'Combine with peas, season, and serve hot'
      ],
      ingredients: [
        { name: 'Grey peas', quantity: 500, unit: 'g' },
        { name: 'Bacon', quantity: 200, unit: 'g' },
        { name: 'Onion', quantity: 1, unit: 'pcs' }
      ]
    }
  ];

  await withClient(async (client) => {
    for (const r of demos) {
      const { rows } = await client.query('SELECT id FROM recipes WHERE title = $1', [r.title]);
      if (rows.length > 0) continue;
      await client.query(
        `INSERT INTO recipes (title, description, steps, images, servings, total_time_minutes, nutrition, ingredients, is_approved)
         VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7::jsonb, $8::jsonb, TRUE)`,
        [
          r.title,
          r.description,
          JSON.stringify(r.steps),
          JSON.stringify(r.images),
          2,
          null,
          JSON.stringify({}),
          JSON.stringify(r.ingredients)
        ]
      );
    }
  });
}