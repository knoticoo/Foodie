import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'recipe';
  structuredData?: object;
  noIndex?: boolean;
  canonicalUrl?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Virtuves Māksla - Receptes un Kulinārijas Padomi',
  description = 'Atklājiet garšīgas receptes, ietaupiet uz pārtikas produktiem un kļūstiet par labāku pavāru ar Virtuves Māksla - Latvijas #1 kulinārijas platformu.',
  keywords = [
    'receptes',
    'kulinārija',
    'ēdiena gatavošana',
    'produktu cenas',
    'latvijas receptes',
    'virtuves māksla',
    'ēdienu plānošana',
    'grocery prices latvia',
    'cooking recipes'
  ],
  image = '/images/og-default.jpg',
  url = typeof window !== 'undefined' ? window.location.href : 'https://virtuves-maksla.lv',
  type = 'website',
  structuredData,
  noIndex = false,
  canonicalUrl,
}) => {
  const siteName = 'Virtuves Māksla';
  const siteUrl = 'https://virtuves-maksla.lv';
  
  // Ensure image is absolute URL
  const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const absoluteUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const canonical = canonicalUrl || absoluteUrl;

  // Default structured data for the website
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    description: description,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/recipes?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.png`
      },
      sameAs: [
        'https://facebook.com/virtuves-maksla',
        'https://instagram.com/virtuves-maksla',
        'https://twitter.com/virtuves_maksla'
      ]
    }
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="lv_LV" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="ru_RU" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:site" content="@virtuves_maksla" />
      <meta name="twitter:creator" content="@virtuves_maksla" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Virtuves Māksla" />
      <meta name="language" content="Latvian" />
      <meta name="geo.region" content="LV" />
      <meta name="geo.country" content="Latvia" />
      <meta name="geo.placename" content="Riga" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#f97316" />
      <meta name="msapplication-TileColor" content="#f97316" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

// Specialized SEO components for different page types
export const RecipeSEO: React.FC<{
  recipe: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    author?: string;
    prepTime?: number;
    cookTime?: number;
    totalTime?: number;
    servings?: number;
    ingredients?: string[];
    instructions?: string[];
    nutrition?: {
      calories?: number;
      protein?: number;
      fat?: number;
      carbs?: number;
    };
    rating?: {
      value: number;
      count: number;
    };
    datePublished?: string;
    dateModified?: string;
  };
}> = ({ recipe }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.image ? (recipe.image.startsWith('http') ? recipe.image : `https://virtuves-maksla.lv${recipe.image}`) : undefined,
    author: {
      '@type': 'Person',
      name: recipe.author || 'Virtuves Māksla'
    },
    datePublished: recipe.datePublished,
    dateModified: recipe.dateModified,
    prepTime: recipe.prepTime ? `PT${recipe.prepTime}M` : undefined,
    cookTime: recipe.cookTime ? `PT${recipe.cookTime}M` : undefined,
    totalTime: recipe.totalTime ? `PT${recipe.totalTime}M` : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} portions` : undefined,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions?.map((instruction, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: instruction
    })),
    nutrition: recipe.nutrition ? {
      '@type': 'NutritionInformation',
      calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
      proteinContent: recipe.nutrition.protein ? `${recipe.nutrition.protein}g` : undefined,
      fatContent: recipe.nutrition.fat ? `${recipe.nutrition.fat}g` : undefined,
      carbohydrateContent: recipe.nutrition.carbs ? `${recipe.nutrition.carbs}g` : undefined
    } : undefined,
    aggregateRating: recipe.rating ? {
      '@type': 'AggregateRating',
      ratingValue: recipe.rating.value,
      ratingCount: recipe.rating.count
    } : undefined,
    recipeCategory: 'Main Course',
    recipeCuisine: 'International',
    keywords: ['recepte', 'ēdiens', 'kulinārija', recipe.title.toLowerCase()].join(', ')
  };

  return (
    <SEOHead
      title={`${recipe.title} - Recepte | Virtuves Māksla`}
      description={recipe.description || `Uzziniet, kā pagatavot ${recipe.title}. Detalizēta recepte ar ingredientiem un norādījumiem.`}
      keywords={['recepte', recipe.title.toLowerCase(), 'kulinārija', 'ēdiena gatavošana']}
      image={recipe.image}
      type="article"
      structuredData={structuredData}
    />
  );
};

export const CategorySEO: React.FC<{
  category: string;
  description?: string;
  recipeCount?: number;
}> = ({ category, description, recipeCount }) => {
  const title = `${category} Receptes | Virtuves Māksla`;
  const desc = description || `Atklājiet ${recipeCount || 'daudzas'} ${category.toLowerCase()} receptes. Garšīgi un vienkārši ēdieni katrai dienai.`;

  return (
    <SEOHead
      title={title}
      description={desc}
      keywords={[category.toLowerCase(), 'receptes', 'kulinārija', 'ēdieni']}
      type="website"
    />
  );
};

export const SearchSEO: React.FC<{
  query: string;
  resultCount?: number;
}> = ({ query, resultCount }) => {
  const title = `"${query}" Receptes - Meklēšanas Rezultāti | Virtuves Māksla`;
  const description = `Atrastas ${resultCount || 'vairākas'} receptes meklējumam "${query}". Atklājiet jaunas garšīgas receptes.`;

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={[query, 'receptes', 'meklēšana', 'kulinārija']}
      type="website"
      noIndex={!query || query.length < 3}
    />
  );
};

export default SEOHead;