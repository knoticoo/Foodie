import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Clock, 
  Star, 
  Heart, 
  Crown, 
  ChefHat,
  TrendingUp,
  Calendar,
  Grid3X3,
  List,
  SlidersHorizontal,
  Users,
  Flame,
  Award,
  Eye
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { cn, getImageUrl, formatTime } from '../lib/utils'

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase

type Recipe = { 
  id: string
  title: string
  description?: string
  cover_image?: string | null
  avg_rating?: number | null
  is_premium_only?: boolean | null
  prep_time_minutes?: number | null
  cook_time_minutes?: number | null
  servings?: number | null
  difficulty?: string | null
  created_at?: string
  view_count?: number
}

const categories = [
  { id: '', label: 'Visas kategorijas', icon: Grid3X3 },
  { id: 'breakfast', label: 'Brokastis', icon: ChefHat },
  { id: 'lunch', label: 'Pusdienas', icon: Clock },
  { id: 'dinner', label: 'Vakariņas', icon: Flame },
  { id: 'dessert', label: 'Deserti', icon: Award },
  { id: 'appetizer', label: 'Uzkodas', icon: Users },
]

const sortOptions = [
  { value: 'top', label: 'Populārākās', icon: TrendingUp },
  { value: 'new', label: 'Jaunākās', icon: Calendar },
  { value: 'rating', label: 'Augstāk vērtētās', icon: Star },
]

const difficulties = [
  { value: '', label: 'Jebkura sarežģītība' },
  { value: 'easy', label: 'Viegla' },
  { value: 'medium', label: 'Vidēja' },
  { value: 'hard', label: 'Sarežģīta' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export const RecipesPage: React.FC = () => {
  const { token, authorizedFetch } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [category, setCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'top' | 'new' | 'rating'>('top')
  const [difficulty, setDifficulty] = useState<string>('')
  const [maxTime, setMaxTime] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const runSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category) params.set('category', category)
      if (difficulty) params.set('difficulty', difficulty)
      if (maxTime) params.set('maxTime', maxTime)
      params.set('limit', String(limit))
      params.set('offset', String(offset))
      params.set('sortBy', sortBy)
      
      const url = `${API_BASE_URL}/api/recipes?${params.toString()}`
      const res = await (token ? authorizedFetch(url) : fetch(url))
      const data = await res.json().catch(() => ({}))
      setRecipes(Array.isArray(data?.recipes) ? data.recipes : [])
    } catch (error) {
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSearch()
  }, [offset, limit, sortBy])

  const resetAndSearch = () => {
    setOffset(0)
    runSearch()
  }

  const RecipeCard: React.FC<{ recipe: Recipe; index: number }> = ({ recipe, index }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
    >
      <Card 
        variant="bordered" 
        hoverable 
        className="group h-full overflow-hidden bg-white hover:shadow-2xl transition-all duration-300"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {recipe.cover_image ? (
            <img 
              src={getImageUrl(recipe.cover_image)} 
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-neutral-400" />
            </div>
          )}
          
          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Premium badge */}
          {recipe.is_premium_only && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-medium shadow-lg">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            </div>
          )}
          
          {/* Quick actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              >
                <Heart className="w-4 h-4 text-red-500" />
              </motion.button>
            </div>
          </div>
          
          {/* Quick stats overlay */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                {recipe.prep_time_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(recipe.prep_time_minutes)}
                  </span>
                )}
                {recipe.view_count && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {recipe.view_count}
                  </span>
                )}
              </div>
              {recipe.avg_rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {recipe.avg_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-lg line-clamp-2 group-hover:text-primary-600 transition-colors">
              {recipe.title}
            </h3>
            
            {recipe.description && (
              <p className="text-neutral-600 text-sm line-clamp-3 leading-relaxed">
                {recipe.description}
              </p>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                {recipe.servings && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {recipe.servings} pers.
                  </span>
                )}
                {recipe.difficulty && (
                  <span className="capitalize px-2 py-1 rounded-full bg-neutral-100 text-neutral-600">
                    {recipe.difficulty}
                  </span>
                )}
              </div>
              
              {recipe.avg_rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3 h-3",
                        i < Math.round(recipe.avg_rating!) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-neutral-300"
                      )}
                    />
                  ))}
                  <span className="text-xs text-neutral-600 ml-1">
                    ({recipe.avg_rating.toFixed(1)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <Link 
          to={`/recipes/${recipe.id}`}
          className="absolute inset-0 z-10"
          aria-label={`Skatīt recepti: ${recipe.title}`}
        />
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-gradient-primary">Receptu</span>{' '}
            <span className="text-gradient-accent">Katalogs</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Atklājiet vairāk nekā 10,000 pārbaudītu receptu no Latvijas labākajiem pavāriem
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card variant="glass" className="p-6">
            {/* Main search */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Meklēt receptes pēc nosaukuma..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                  className="text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && resetAndSearch()}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<SlidersHorizontal className="w-4 h-4" />}
                  className={cn(showFilters && "bg-primary-50 border-primary-300")}
                >
                  Filtri
                </Button>
                
                <Button
                  variant="gradient"
                  onClick={resetAndSearch}
                  loading={loading}
                  icon={<Search className="w-4 h-4" />}
                >
                  Meklēt
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    category === cat.id
                      ? "bg-primary-500 text-white shadow-lg"
                      : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  )}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </motion.button>
              ))}
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-neutral-200 pt-6 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Sarežģītība</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {difficulties.map(diff => (
                          <option key={diff.value} value={diff.value}>{diff.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Maks. laiks (min)</label>
                      <Input
                        type="number"
                        value={maxTime}
                        onChange={(e) => setMaxTime(e.target.value)}
                        placeholder="60"
                        icon={<Clock className="w-4 h-4" />}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Kārtot pēc</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'top' | 'new' | 'rating')}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-neutral-600">
              Atrastas <span className="font-semibold text-neutral-900">{recipes.length}</span> receptes
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Skats:</span>
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'grid' ? "bg-primary-500 text-white" : "hover:bg-neutral-100"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'list' ? "bg-primary-500 text-white" : "hover:bg-neutral-100"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-600">Meklējam receptes...</p>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "gap-6 mb-8",
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            )}
          >
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </motion.div>
        )}

        {recipes.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">Nav atrasta neviena recepte</h3>
            <p className="text-neutral-500 mb-6">Izmēģiniet citus meklēšanas kritērijus</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Notīrīt filtrus
            </Button>
          </motion.div>
        )}

        {/* Pagination */}
        {recipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4"
          >
            <Button
              variant="outline"
              disabled={offset === 0}
              onClick={() => setOffset(o => Math.max(o - limit, 0))}
            >
              Iepriekšējā
            </Button>
            
            <span className="text-neutral-600">
              Lapa {Math.floor(offset / limit) + 1}
            </span>
            
            <Button
              variant="outline"
              disabled={recipes.length < limit}
              onClick={() => setOffset(o => o + limit)}
            >
              Nākamā
            </Button>
            
            <select 
              value={limit} 
              onChange={e => setLimit(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </motion.div>
        )}
      </div>
    </div>
  )
}