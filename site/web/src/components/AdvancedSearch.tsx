import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  ChefHat, 
  Star, 
  Users, 
  Zap,
  Sparkles,
  TrendingUp,
  History
} from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  type: 'recipe' | 'ingredient' | 'category' | 'tag' | 'recent' | 'trending';
  text: string;
  subtitle?: string;
  count?: number;
  image?: string;
  rating?: number;
  cookTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface SearchFilters {
  categories: string[];
  cookingTime: { min: number; max: number };
  difficulty: string[];
  dietary: string[];
  rating: number;
  ingredients: string[];
  sortBy: 'relevance' | 'rating' | 'newest' | 'cookTime' | 'popularity';
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  initialQuery?: string;
  className?: string;
  showFilters?: boolean;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSuggestionSelect,
  placeholder = "Meklēt receptes, sastāvdaļas, kategorijas...",
  initialQuery = "",
  className = "",
  showFilters = true
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Default filters
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    cookingTime: { min: 0, max: 180 },
    difficulty: [],
    dietary: [],
    rating: 0,
    ingredients: [],
    sortBy: 'relevance'
  });

  // Mock data for demonstration
  const categories = [
    'Brokastis', 'Pusdienas', 'Vakariņas', 'Uzkodas', 'Deserti', 
    'Zupas', 'Salāti', 'Gaļas ēdieni', 'Zivis', 'Veģetārie ēdieni'
  ];

  const dietary = [
    'Veģetārs', 'Vegāns', 'Bezglutēna', 'Bezlaktozes', 'Keto', 
    'Paleo', 'Diabētiķiem', 'Zemas kalorijas'
  ];

  const popularIngredients = [
    'Vistas gaļa', 'Olas', 'Piens', 'Miltи', 'Sīpoli', 'Ķiploki',
    'Tomāti', 'Burkāni', 'Kartupeļi', 'Rīsi', 'Makaroni', 'Siers'
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  }, []);

  // Generate suggestions based on query
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      // Show recent searches and trending when no query
      const recent: SearchSuggestion[] = recentSearches.slice(0, 3).map((search, index) => ({
        id: `recent-${index}`,
        type: 'recent',
        text: search,
        subtitle: 'Nesenā meklēšana'
      }));

      const trending: SearchSuggestion[] = [
        {
          id: 'trending-1',
          type: 'trending',
          text: 'Ziemas zupas',
          subtitle: 'Populārs šonedēļ',
          count: 156
        },
        {
          id: 'trending-2',
          type: 'trending',
          text: 'Vegānie deserti',
          subtitle: 'Augošā popularitāte',
          count: 89
        }
      ];

      setSuggestions([...recent, ...trending]);
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockSuggestions = generateMockSuggestions(debouncedQuery);
      setSuggestions(mockSuggestions);
      setLoading(false);
    }, 200);
  }, [debouncedQuery, recentSearches]);

  const generateMockSuggestions = (searchQuery: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    const query = searchQuery.toLowerCase();

    // Recipe suggestions
    const recipeMatches = [
      { name: 'Vistas biļinājums ar dārzeņiem', rating: 4.8, cookTime: 45, image: '/images/chicken-stew.jpg' },
      { name: 'Veģetārā pasta ar tomātiem', rating: 4.6, cookTime: 25, image: '/images/veggie-pasta.jpg' },
      { name: 'Šokolādes kūka', rating: 4.9, cookTime: 60, image: '/images/chocolate-cake.jpg' }
    ].filter(recipe => recipe.name.toLowerCase().includes(query));

    recipeMatches.forEach((recipe, index) => {
      suggestions.push({
        id: `recipe-${index}`,
        type: 'recipe',
        text: recipe.name,
        subtitle: `${recipe.cookTime} min • ${recipe.rating} ⭐`,
        rating: recipe.rating,
        cookTime: recipe.cookTime,
        image: recipe.image
      });
    });

    // Ingredient suggestions
    const ingredientMatches = popularIngredients
      .filter(ingredient => ingredient.toLowerCase().includes(query))
      .slice(0, 3);

    ingredientMatches.forEach((ingredient, index) => {
      suggestions.push({
        id: `ingredient-${index}`,
        type: 'ingredient',
        text: ingredient,
        subtitle: 'Sastāvdaļa',
        count: Math.floor(Math.random() * 200) + 50
      });
    });

    // Category suggestions
    const categoryMatches = categories
      .filter(category => category.toLowerCase().includes(query))
      .slice(0, 2);

    categoryMatches.forEach((category, index) => {
      suggestions.push({
        id: `category-${index}`,
        type: 'category',
        text: category,
        subtitle: 'Kategorija',
        count: Math.floor(Math.random() * 100) + 20
      });
    });

    return suggestions.slice(0, 8);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Add to recent searches
    saveRecentSearch(suggestion.text);
    
    onSuggestionSelect(suggestion);
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query);
      onSearch(query, filters);
      setIsOpen(false);
    }
  };

  const saveRecentSearch = (searchTerm: string) => {
    try {
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save recent search:', error);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recipe': return <ChefHat className="w-4 h-4 text-orange-500" />;
      case 'ingredient': return <Sparkles className="w-4 h-4 text-green-500" />;
      case 'category': return <Filter className="w-4 h-4 text-blue-500" />;
      case 'recent': return <History className="w-4 h-4 text-gray-400" />;
      case 'trending': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default: return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          autoComplete="off"
          spellCheck="false"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              onClick={clearQuery}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`p-2 mr-2 rounded-lg transition-colors ${
                showFiltersPanel || Object.values(filters).some(f => 
                  Array.isArray(f) ? f.length > 0 : f > 0
                )
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Meklē...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                      selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    whileHover={{ x: 2 }}
                  >
                    {suggestion.image ? (
                      <img
                        src={suggestion.image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.subtitle && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                    
                    {suggestion.count && (
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {suggestion.count}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Nav atrasti rezultāti
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Sāciet rakstīt, lai meklētu...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategorijas
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          categories: prev.categories.includes(category)
                            ? prev.categories.filter(c => c !== category)
                            : [...prev.categories, category]
                        }));
                      }}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        filters.categories.includes(category)
                          ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooking Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gatavošanas laiks (minūtes)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={filters.cookingTime.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      cookingTime: { ...prev.cookingTime, max: parseInt(e.target.value) }
                    }))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-0">
                    līdz {filters.cookingTime.max} min
                  </span>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diētas prasības
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietary.map(diet => (
                    <button
                      key={diet}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          dietary: prev.dietary.includes(diet)
                            ? prev.dietary.filter(d => d !== diet)
                            : [...prev.dietary, diet]
                        }));
                      }}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        filters.dietary.includes(diet)
                          ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-500'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kārtot pēc
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as SearchFilters['sortBy']
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="relevance">Atbilstība</option>
                  <option value="rating">Vērtējums</option>
                  <option value="newest">Jaunākās</option>
                  <option value="cookTime">Gatavošanas laiks</option>
                  <option value="popularity">Popularitāte</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleSearch()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Meklēt ar filtriem
                </button>
                <button
                  onClick={() => {
                    setFilters({
                      categories: [],
                      cookingTime: { min: 0, max: 180 },
                      difficulty: [],
                      dietary: [],
                      rating: 0,
                      ingredients: [],
                      sortBy: 'relevance'
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Notīrīt
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;