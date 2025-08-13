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
  Clock
} from 'lucide-react'

// Environment variables
const API = (import.meta as any).env?.VITE_API_BASE_URL || 
             window.__VITE__?.VITE_API_BASE_URL || 
             'http://localhost:3000'

const STATIC_BASE = (import.meta as any).env?.VITE_STATIC_BASE_URL || 
                    window.__VITE__?.VITE_STATIC_BASE_URL || 
                    'http://localhost:8080'

const ADMIN_API_KEY = (import.meta as any).env?.VITE_ADMIN_API_KEY || 
                      window.__VITE__?.VITE_ADMIN_API_KEY || ''

const PUBLIC_WEB_BASE = (import.meta as any).env?.VITE_PUBLIC_WEB_BASE_URL || 
                        (window as any).__VITE__?.VITE_PUBLIC_WEB_BASE_URL || 
                        window.location.origin.replace(':5173', ':80')

// Button Component
const Button: React.FC<{
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  className?: string
}> = ({ 
  children = '', 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled, 
  loading,
  icon,
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
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
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : icon}
      {children}
    </button>
  )
}

// Server Status Component
const ServerStatus: React.FC<{ health: any }> = ({ health }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Server className="w-5 h-5" />
      Server Status
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full animate-pulse ${health ? 'bg-green-500' : 'bg-red-500'}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">API Server</p>
          <p className="text-xs text-gray-500">{health ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Database className="w-4 h-4 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-gray-900">Database</p>
          <p className="text-xs text-gray-500">{health ? 'Connected' : 'Disconnected'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-yellow-500" />
        <div>
          <p className="text-sm font-medium text-gray-900">Response Time</p>
          <p className="text-xs text-gray-500">{health?.durationMs || 0}ms</p>
        </div>
      </div>
    </div>
  </div>
)

// Statistics Component
const Statistics: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <BarChart3 className="w-5 h-5" />
      Statistics
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total_users || 0}</p>
        <p className="text-sm text-gray-600">Total Users</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <BookOpen className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total_recipes || 0}</p>
        <p className="text-sm text-gray-600">Total Recipes</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <MessageSquare className="w-6 h-6 text-purple-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total_comments || 0}</p>
        <p className="text-sm text-gray-600">Total Comments</p>
      </div>
    </div>
  </div>
)

// Recipes Module
const RecipesModule: React.FC<{ recipes: any[], loading: boolean, onLoadRecipes: () => void }> = ({ recipes, loading, onLoadRecipes }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Recipes Management
      </h2>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={onLoadRecipes}
          loading={loading}
        >
          Refresh
        </Button>
        <Button 
          variant="primary" 
          icon={<Plus className="w-4 h-4" />}
        >
          Add Recipe
        </Button>
      </div>
    </div>
    
    {loading ? (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading recipes...</span>
      </div>
    ) : recipes.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Author</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe, index) => (
              <tr key={recipe.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-medium text-gray-900">{recipe.title || 'Untitled'}</td>
                <td className="py-4 px-4 text-gray-600">{recipe.author || 'Unknown'}</td>
                <td className="py-4 px-4 text-gray-600 text-sm">
                  {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString() : 'Unknown'}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                    <Button variant="ghost" size="sm" icon={<Edit3 className="w-4 h-4" />} />
                    <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No recipes found</h3>
        <p className="text-gray-500 mb-4">Start by loading recipes from the database</p>
        <Button variant="primary" onClick={onLoadRecipes} icon={<RefreshCw className="w-4 h-4" />}>
          Load Recipes
        </Button>
      </div>
    )}
  </div>
)

// Users Module
const UsersModule: React.FC<{ users: any[], loading: boolean, onLoadUsers: () => void }> = ({ users, loading, onLoadUsers }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Users Management
      </h2>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={onLoadUsers}
          loading={loading}
        >
          Refresh
        </Button>
        <Button 
          variant="primary" 
          icon={<Plus className="w-4 h-4" />}
        >
          Add User
        </Button>
      </div>
    </div>
    
    {loading ? (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    ) : users.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(user.name || user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">
                      {user.name || user.full_name || 'No name'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{user.email}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    user.is_admin ? 'bg-red-100 text-red-800' : 
                    user.is_premium ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.is_admin ? 'Admin' : user.is_premium ? 'Premium' : 'Active'}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-600 text-sm">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                    <Button variant="ghost" size="sm" icon={<Edit3 className="w-4 h-4" />} />
                    <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No users found</h3>
        <p className="text-gray-500 mb-4">Start by loading users from the database</p>
        <Button variant="primary" onClick={onLoadUsers} icon={<RefreshCw className="w-4 h-4" />}>
          Load Users
        </Button>
      </div>
    )}
  </div>
)

export function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState({
    total_users: 0,
    total_recipes: 0,
    total_comments: 0,
    total_ratings: 0
  })
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [recipesLoading, setRecipesLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load health check
        const healthRes = await fetch(`${API}/api/health`)
        const healthData = await healthRes.json()
        setHealth(healthData)

        // Load stats
        const statsRes = await fetch(`${API}/api/admin/stats`, {
          headers: ADMIN_API_KEY ? { 'X-Admin-Api-Key': ADMIN_API_KEY } : {}
        })
        const statsData = await statsRes.json()
        setStats(statsData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load users function
  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch(`${API}/api/admin/users`, {
        headers: ADMIN_API_KEY ? { 'X-Admin-Api-Key': ADMIN_API_KEY } : {}
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(Array.isArray(data) ? data : data.users || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  // Load recipes function
  const loadRecipes = async () => {
    setRecipesLoading(true)
    try {
      const response = await fetch(`${API}/api/admin/recipes`, {
        headers: ADMIN_API_KEY ? { 'X-Admin-Api-Key': ADMIN_API_KEY } : {}
      })
      if (response.ok) {
        const data = await response.json()
        setRecipes(Array.isArray(data) ? data : data.recipes || [])
      }
    } catch (error) {
      console.error('Error loading recipes:', error)
    } finally {
      setRecipesLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading admin panel...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        animate={{ 
          width: sidebarCollapsed ? 80 : 280,
          x: mobileMenuOpen ? 0 : -280
        }}
        className="fixed lg:relative bg-white border-r border-gray-200 flex flex-col z-50 lg:z-auto lg:translate-x-0"
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
                  <p className="text-xs text-gray-500">Admin Panel</p>
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
              {!sidebarCollapsed && 'Main'}
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-blue-500 text-white shadow-lg">
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => window.open(PUBLIC_WEB_BASE, '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Public Site</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    setSidebarCollapsed(!sidebarCollapsed)
                  } else {
                    setMobileMenuOpen(!mobileMenuOpen)
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Server Status Module */}
            <ServerStatus health={health} />
            
            {/* Statistics Module */}
            <Statistics stats={stats} />
            
            {/* Recipes Module */}
            <RecipesModule 
              recipes={recipes} 
              loading={recipesLoading} 
              onLoadRecipes={loadRecipes} 
            />
            
            {/* Users Module */}
            <UsersModule 
              users={users} 
              loading={usersLoading} 
              onLoadUsers={loadUsers} 
            />
          </div>
        </main>
      </div>
    </div>
  )
}