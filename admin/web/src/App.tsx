import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Users,
  BookOpen,
  Star,
  Activity,
  Settings,
  LogOut,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ChefHat,
  MessageSquare,
  RefreshCw,
  Menu,
  X,
  Globe,
  Database,
  Server,
  CheckCircle,
  AlertCircle,
  Clock,
  Key,
  UserPlus,
  Crown,
  Save,
  Cancel,
  Filter,
  Download,
  Upload
} from 'lucide-react'

// Environment variables
const API = (import.meta as any).env?.VITE_API_BASE_URL || 
             window.__VITE__?.VITE_API_BASE_URL || 
             'http://localhost:3000'

const STATIC_BASE = (import.meta as any).env?.VITE_STATIC_BASE_URL || 
                    window.__VITE__?.VITE_STATIC_BASE_URL || 
                    'http://localhost:8080'

const DEFAULT_ADMIN_API_KEY = (import.meta as any).env?.VITE_ADMIN_API_KEY || 
                      window.__VITE__?.VITE_ADMIN_API_KEY || ''

const PUBLIC_WEB_BASE = (import.meta as any).env?.VITE_PUBLIC_WEB_BASE_URL || 
                        (window as any).__VITE__?.VITE_PUBLIC_WEB_BASE_URL || 
                        window.location.origin.replace(':5173', ':80')

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Enhanced Button Component
const Button: React.FC<{
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  className?: string
  as?: any
  href?: string
  target?: string
  rel?: string
}> = ({ 
  children = '', 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled, 
  loading,
  icon,
  className = '',
  ...rest
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
    secondary: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl focus:ring-green-500'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  }
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      {...rest}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : icon}
      {children}
    </motion.button>
  )
}

// Enhanced Modal Component
const Modal: React.FC<{
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Enhanced Server Status Component
const ServerStatus: React.FC<{ health: any }> = ({ health }) => (
  <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <Server className="w-5 h-5 text-blue-500" />
      Servera statuss
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className={`w-4 h-4 rounded-full animate-pulse ${health ? 'bg-green-500' : 'bg-red-500'}`} />
        <div>
          <p className="font-semibold text-gray-900">API Serveris</p>
          <p className="text-sm text-gray-500">{health ? 'Darbojas' : 'Nedarbojās'}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <Database className="w-5 h-5 text-blue-500" />
        <div>
          <p className="font-semibold text-gray-900">Datubāze</p>
          <p className="text-sm text-gray-500">{health ? 'Savienots' : 'Nav savienots'}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <Clock className="w-5 h-5 text-yellow-500" />
        <div>
          <p className="font-semibold text-gray-900">Atbildes laiks</p>
          <p className="text-sm text-gray-500">{health?.durationMs || 0}ms</p>
        </div>
      </div>
    </div>
  </motion.div>
)

// Enhanced Statistics Component
const Statistics: React.FC<{ stats: any }> = ({ stats }) => (
  <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <BarChart3 className="w-5 h-5 text-purple-500" />
      Statistika
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <motion.div 
        className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6 text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total_users || 0}</p>
        <p className="text-sm text-gray-600">Kopā lietotāji</p>
      </motion.div>
      <motion.div 
        className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total_recipes || 0}</p>
        <p className="text-sm text-gray-600">Kopā receptes</p>
      </motion.div>
      <motion.div 
        className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl"
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total_comments || 0}</p>
        <p className="text-sm text-gray-600">Komentāri</p>
      </motion.div>
      <motion.div 
        className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Star className="w-6 h-6 text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{Number(stats.average_rating || 0).toFixed(1)}</p>
        <p className="text-sm text-gray-600">Vid. vērtējums</p>
      </motion.div>
    </div>
  </motion.div>
)

// Enhanced Recipes Module
const RecipesModule: React.FC<{ 
  recipes: any[]
  loading: boolean
  onRefresh: () => void
  apiKey: string
}> = ({ recipes, loading, onRefresh, apiKey }) => {
  const [editingRecipe, setEditingRecipe] = useState<any | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'approved' && recipe.is_approved !== false) ||
      (filter === 'pending' && recipe.is_approved === false) ||
      (filter === 'premium' && recipe.is_premium_only)
    return matchesSearch && matchesFilter
  })

  const updateRecipe = async (id: string, updates: any) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-Admin-Api-Key'] = apiKey;
      
      const response = await fetch(`${API}/api/admin/recipes/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        onRefresh()
        setEditingRecipe(null)
      }
    } catch (e) {
      console.error('Failed to update recipe:', e)
    }
  }

  const deleteRecipe = async (id: string) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo recepti?')) return
    
    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers['X-Admin-Api-Key'] = apiKey;
      
      const response = await fetch(`${API}/api/admin/recipes/${id}`, {
        method: 'DELETE',
        headers
      })
      
      if (response.ok) {
        onRefresh()
      }
    } catch (e) {
      console.error('Failed to delete recipe:', e)
    }
  }

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-500" />
          Receptu pārvaldība
        </h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={onRefresh}>
            Atjaunot
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Pievienot recepti
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Meklēt receptes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">Visas receptes</option>
          <option value="approved">Apstiprinātas</option>
          <option value="pending">Gaida apstiprinājumu</option>
          <option value="premium">Premium receptes</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <span className="text-gray-600">Ielādē receptes...</span>
          </div>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Nosaukums</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Autors</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Statuss</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Izveidots</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Darbības</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map((recipe, index) => (
                <motion.tr 
                  key={recipe.id || index} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-gray-900">{recipe.title || 'Bez nosaukuma'}</div>
                      {recipe.is_premium_only && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{recipe.author_email || recipe.author_user_id || 'Nezināms'}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      recipe.is_approved === false 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {recipe.is_approved === false ? 'Gaida apstiprinājumu' : 'Apstiprināta'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString('lv-LV') : 'Nezināms'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Eye className="w-4 h-4" />} 
                        onClick={() => window.open(`${PUBLIC_WEB_BASE}/recipes/${recipe.id}`, '_blank')}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Edit3 className="w-4 h-4" />} 
                        onClick={() => setEditingRecipe(recipe)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Trash2 className="w-4 h-4 text-red-500" />} 
                        onClick={() => deleteRecipe(recipe.id)}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchTerm || filter !== 'all' ? 'Nav atrasts neviens rezultāts' : 'Nav atrasta neviena recepte'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Mēģiniet mainīt meklēšanas kritērijus' 
              : 'Receptes parādīsies automātiski, kad tās būs pieejamas datubāzē'
            }
          </p>
          {(!searchTerm && filter === 'all') && (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Pievienot pirmo recepti
            </Button>
          )}
        </div>
      )}

      {/* Edit Recipe Modal */}
      <Modal
        isOpen={!!editingRecipe}
        onClose={() => setEditingRecipe(null)}
        title="Rediģēt recepti"
        size="lg"
      >
        {editingRecipe && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nosaukums</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingRecipe.title || ''}
                onChange={e => setEditingRecipe({...editingRecipe, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apraksts</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={editingRecipe.description || ''}
                onChange={e => setEditingRecipe({...editingRecipe, description: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={editingRecipe.is_premium_only || false}
                  onChange={e => setEditingRecipe({...editingRecipe, is_premium_only: e.target.checked})}
                />
                <span className="text-sm text-gray-700">Premium recepte</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={editingRecipe.is_approved !== false}
                  onChange={e => setEditingRecipe({...editingRecipe, is_approved: e.target.checked})}
                />
                <span className="text-sm text-gray-700">Apstiprināta</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setEditingRecipe(null)}>
                Atcelt
              </Button>
              <Button 
                variant="primary" 
                icon={<Save className="w-4 h-4" />}
                onClick={() => updateRecipe(editingRecipe.id, {
                  title: editingRecipe.title,
                  description: editingRecipe.description,
                  is_premium_only: editingRecipe.is_premium_only,
                  is_approved: editingRecipe.is_approved
                })}
              >
                Saglabāt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}

// Enhanced Users Module - similar improvements as Recipes
const UsersModule: React.FC<{ 
  users: any[]
  loading: boolean
  onRefresh: () => void
  apiKey: string
}> = ({ users, loading, onRefresh, apiKey }) => {
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'premium' && user.is_premium) ||
      (filter === 'admin' && user.is_admin) ||
      (filter === 'new' && new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    return matchesSearch && matchesFilter
  })

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Lietotāju pārvaldība
        </h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={onRefresh}>
            Atjaunot
          </Button>
          <Button variant="primary" icon={<UserPlus className="w-4 h-4" />}>
            Pievienot lietotāju
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Meklēt lietotājus..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">Visi lietotāji</option>
          <option value="premium">Premium lietotāji</option>
          <option value="admin">Administratori</option>
          <option value="new">Jauni (7 dienas)</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <span className="text-gray-600">Ielādē lietotājus...</span>
          </div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Lietotājs</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">E-pasts</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Statuss</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Reģistrēts</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Darbības</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr 
                  key={user.id || index} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.full_name || 'Bez vārda'}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{user.email}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1">
                      {user.is_admin && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Admin
                        </span>
                      )}
                      {user.is_premium && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                      {!user.is_admin && !user.is_premium && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Aktīvs
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('lv-LV') : 'Nezināms'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Edit3 className="w-4 h-4" />}
                        onClick={() => setEditingUser(user)}
                      />
                      <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4 text-red-500" />} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchTerm || filter !== 'all' ? 'Nav atrasts neviens lietotājs' : 'Nav atrasts neviens lietotājs'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Mēģiniet mainīt meklēšanas kritērijus' 
              : 'Lietotāji parādīsies automātiski, kad tie reģistrēsies'
            }
          </p>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Rediģēt lietotāju"
      >
        {editingUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vārds</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingUser.full_name || ''}
                onChange={e => setEditingUser({...editingUser, full_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-pasts</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingUser.email || ''}
                onChange={e => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={editingUser.is_premium || false}
                  onChange={e => setEditingUser({...editingUser, is_premium: e.target.checked})}
                />
                <span className="text-sm text-gray-700">Premium statuss</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={editingUser.is_admin || false}
                  onChange={e => setEditingUser({...editingUser, is_admin: e.target.checked})}
                />
                <span className="text-sm text-gray-700">Administratora tiesības</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setEditingUser(null)}>
                Atcelt
              </Button>
              <Button variant="primary" icon={<Save className="w-4 h-4" />}>
                Saglabāt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}

// Enhanced Comments Module
const CommentsModule: React.FC<{ 
  comments: any[]
  loading: boolean
  onRefresh: () => void
  onDelete: (id: string) => void
}> = ({ comments, loading, onRefresh, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredComments = comments.filter(comment =>
    comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.recipe_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          Komentāru pārvaldība
        </h2>
        <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={onRefresh}>
          Atjaunot
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Meklēt komentāros..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <span className="text-gray-600">Ielādē komentārus...</span>
          </div>
        </div>
      ) : filteredComments.length > 0 ? (
        <div className="space-y-4">
          {filteredComments.map((comment, index) => (
            <motion.div
              key={comment.id || index}
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{comment.recipe_title || comment.recipe_id}</h4>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{comment.email || comment.user_id}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <div className="text-xs text-gray-500">
                    {comment.created_at ? new Date(comment.created_at).toLocaleString('lv-LV') : ''}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={<Trash2 className="w-4 h-4 text-red-500" />} 
                  onClick={() => onDelete(comment.id)}
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchTerm ? 'Nav atrasts neviens komentārs' : 'Nav atrasts neviens komentārs'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Mēģiniet mainīt meklēšanas kritērijus' 
              : 'Komentāri parādīsies automātiski, kad lietotāji tos rakstīs'
            }
          </p>
        </div>
      )}
    </motion.div>
  )
}

export function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recipes' | 'users' | 'comments'>('dashboard')
  const [stats, setStats] = useState({
    total_users: 0,
    total_recipes: 0,
    total_comments: 0,
    total_ratings: 0,
    total_chefs: 0,
    average_rating: 0
  })
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [recipesLoading, setRecipesLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [adminKey, setAdminKey] = useState<string>(localStorage.getItem('ADMIN_API_KEY') || DEFAULT_ADMIN_API_KEY || '')
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('ADMIN_API_KEY', adminKey || '')
  }, [adminKey])

  const buildHeaders = (): HeadersInit => {
    const h: Record<string, string> = {}
    if (adminKey) h['X-Admin-Api-Key'] = adminKey
    return h
  }

  const refreshData = async () => {
    setRecipesLoading(true); 
    setUsersLoading(true); 
    setCommentsLoading(true);
    setApiError(null);
    
    try {
      const headers = buildHeaders();
      const [usersRes, recipesRes, commentsRes] = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers }),
        fetch(`${API}/api/admin/recipes`, { headers }),
        fetch(`${API}/api/admin/comments`, { headers })
      ])

      if (usersRes.status === 403 || recipesRes.status === 403 || commentsRes.status === 403) {
        setApiError('Nav pietiekamu tiesību. Pārbaudiet Admin API atslēgu.')
      } else if (usersRes.status === 401 || recipesRes.status === 401 || commentsRes.status === 401) {
        setApiError('Nepieciešama autentifikācija. Ievadiet derīgu Admin API atslēgu.')
      } else {
        if (usersRes.ok) {
          const du = await usersRes.json();
          setUsers(Array.isArray(du) ? du : du.users || [])
        }
        if (recipesRes.ok) {
          const dr = await recipesRes.json();
          setRecipes(Array.isArray(dr) ? dr : dr.recipes || [])
        }
        if (commentsRes.ok) {
          const dc = await commentsRes.json();
          setComments(Array.isArray(dc) ? dc : dc.comments || [])
        }
      }
    } catch (e) {
      console.error('API Error:', e);
      setApiError('Neizdevās izveidot savienojumu ar serveri. Pārbaudiet, vai API darbojas.')
    } finally {
      setRecipesLoading(false); 
      setUsersLoading(false); 
      setCommentsLoading(false);
    }
  }

  // Load data periodically
  useEffect(() => {
    let timer: any;
    const loadAll = async () => {
      await refreshData();
      timer = setTimeout(loadAll, 30000); // Refresh every 30 seconds
    }
    loadAll();
    return () => { if (timer) clearTimeout(timer) }
  }, [adminKey])

  const deleteComment = async (id: string) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo komentāru?')) return
    
    try {
      const res = await fetch(`${API}/api/admin/comments/${id}`, { 
        method: 'DELETE', 
        headers: buildHeaders() 
      })
      if (res.status === 204) {
        setComments(prev => prev.filter(c => c.id !== id))
      }
    } catch (e) {
      console.error('Failed to delete comment:', e)
    }
  }

  // Load initial health and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        const healthRes = await fetch(`${API}/api/health`)
        if (healthRes.ok) {
          setHealth(await healthRes.json())
        } else {
          setHealth(null)
        }

        try {
          const pubStatsRes = await fetch(`${API}/api/stats`)
          if (pubStatsRes.ok) {
            const pub = await pubStatsRes.json()
            setStats((s) => ({
              ...s,
              total_users: Number(pub.total_users || s.total_users),
              total_recipes: Number(pub.total_recipes || s.total_recipes),
              total_chefs: Number(pub.total_chefs || 0),
              average_rating: Number(pub.average_rating || 0)
            }))
          }
        } catch {}

        try {
          const statsRes = await fetch(`${API}/api/admin/stats`, { headers: buildHeaders() })
          if (statsRes.ok) {
            const adminStats = await statsRes.json()
            setStats((s) => ({ ...s, ...adminStats }))
          }
        } catch {}
      } catch {
        setHealth(null)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [adminKey])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ielādē admin paneli...</h2>
          <p className="text-gray-600">Lūdzu, uzgaidiet</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        animate={{ 
          width: sidebarCollapsed ? 80 : 280,
          x: mobileMenuOpen ? 0 : -280
        }}
        className="fixed lg:relative bg-white border-r border-gray-200 flex flex-col z-50 lg:z-auto lg:translate-x-0 shadow-xl"
        style={{ x: mobileMenuOpen ? 0 : undefined }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="font-bold text-gray-900">Virtuves Māksla</h2>
                  <p className="text-xs text-gray-500">Admin panelis</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
              {!sidebarCollapsed && 'Galvenais'}
            </div>
            
            <motion.button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab==='dashboard'
                  ?'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  :'text-gray-700 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Pārskats</span>}
            </motion.button>
            
            <motion.button 
              onClick={() => setActiveTab('recipes')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab==='recipes'
                  ?'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  :'text-gray-700 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Receptes</span>}
            </motion.button>
            
            <motion.button 
              onClick={() => setActiveTab('users')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab==='users'
                  ?'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  :'text-gray-700 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Lietotāji</span>}
            </motion.button>
            
            <motion.button 
              onClick={() => setActiveTab('comments')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab==='comments'
                  ?'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  :'text-gray-700 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Komentāri</span>}
            </motion.button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {!sidebarCollapsed && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Admin API atslēga</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  value={adminKey} 
                  onChange={e => setAdminKey(e.target.value)} 
                  placeholder="Ievadiet ADMIN_API_KEY" 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  type="password"
                />
              </div>
              {apiError && (
                <div className="text-xs text-red-600 p-2 bg-red-50 rounded-lg">
                  {apiError}
                </div>
              )}
            </div>
          )}
          
          <motion.button
            onClick={() => window.open(PUBLIC_WEB_BASE, '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Publiskā vietne</span>}
          </motion.button>
          
          <motion.button 
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Iziet</span>}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    setSidebarCollapsed(!sidebarCollapsed)
                  } else {
                    setMobileMenuOpen(!mobileMenuOpen)
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin panelis</h1>
                <p className="text-sm text-gray-500">Pārvaldiet savu kulinārijas platformu</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {health && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Sistēma darbojas
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div 
            className="max-w-7xl mx-auto space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {activeTab === 'dashboard' && (
              <>
                <ServerStatus health={health} />
                <Statistics stats={stats} />
              </>
            )}
            {activeTab === 'recipes' && (
              <RecipesModule 
                recipes={recipes} 
                loading={recipesLoading} 
                onRefresh={refreshData}
                apiKey={adminKey}
              />
            )}
            {activeTab === 'users' && (
              <UsersModule 
                users={users} 
                loading={usersLoading} 
                onRefresh={refreshData}
                apiKey={adminKey}
              />
            )}
            {activeTab === 'comments' && (
              <CommentsModule 
                comments={comments} 
                loading={commentsLoading} 
                onRefresh={refreshData}
                onDelete={deleteComment} 
              />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}