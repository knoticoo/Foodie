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

const DEFAULT_ADMIN_API_KEY = (import.meta as any).env?.VITE_ADMIN_API_KEY || 
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
      {...rest}
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <ChefHat className="w-6 h-6 text-amber-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total_chefs || 0}</p>
        <p className="text-sm text-gray-600">Chefs</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Star className="w-6 h-6 text-purple-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{Number(stats.average_rating || 0).toFixed(1)}</p>
        <p className="text-sm text-gray-600">Avg Rating</p>
      </div>
    </div>
  </div>
)

// Recipes Module
const RecipesModule: React.FC<{ recipes: any[], loading: boolean }> = ({ recipes, loading }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Recipes Management
      </h2>
      <div className="flex gap-2">
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
                <td className="py-4 px-4 text-gray-600">{recipe.author_email || recipe.author_user_id || 'Unknown'}</td>
                <td className="py-4 px-4 text-gray-600 text-sm">
                  {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString() : 'Unknown'}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => window.open(`${PUBLIC_WEB_BASE}/recipes/${recipe.id}`, '_blank')} />
                    <Button variant="ghost" size="sm" icon={<Edit3 className="w-4 h-4" />} onClick={async () => {
                      const title = prompt('Update title', recipe.title || '')?.trim()
                      if (title && title.length >= 3) {
                        try {
                          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                          const key = localStorage.getItem('ADMIN_API_KEY') || DEFAULT_ADMIN_API_KEY;
                          if (key) headers['X-Admin-Api-Key'] = key;
                          await fetch(`${API}/api/admin/recipes/${recipe.id}`, {
                            method: 'PUT',
                            headers,
                            body: JSON.stringify({ title })
                          })
                        } catch (e) {
                          console.error('Failed to update recipe:', e)
                        }
                      }
                    }} />
                    <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={async () => {
                      if (!confirm('Delete this recipe?')) return
                      try {
                        const headers: Record<string, string> = {};
                        const key = localStorage.getItem('ADMIN_API_KEY') || DEFAULT_ADMIN_API_KEY;
                        if (key) headers['X-Admin-Api-Key'] = key;
                        await fetch(`${API}/api/admin/recipes/${recipe.id}`, {
                          method: 'DELETE',
                          headers
                        })
                      } catch (e) {
                        console.error('Failed to delete recipe:', e)
                      }
                    }} />
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
        <p className="text-gray-500 mb-4">Data will appear automatically.</p>
      </div>
    )}
  </div>
)

// Users Module
const UsersModule: React.FC<{ users: any[], loading: boolean }> = ({ users, loading }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Users Management
      </h2>
      <div className="flex gap-2">
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
        <p className="text-gray-500 mb-4">Data will appear automatically.</p>
      </div>
    )}
  </div>
)

// Comments Module
const CommentsModule: React.FC<{ comments: any[], loading: boolean, onDelete: (id: string) => void }> = ({ comments, loading, onDelete }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments
      </h2>
    </div>
    {loading ? (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading comments...</span>
      </div>
    ) : comments.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Recipe</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Content</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c, index) => (
              <tr key={c.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{c.recipe_title || c.recipe_id}</td>
                <td className="py-3 px-4 text-gray-600">{c.email || c.user_id}</td>
                <td className="py-3 px-4 text-gray-700 max-w-xl truncate">{c.content}</td>
                <td className="py-3 px-4 text-gray-600 text-sm">{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</td>
                <td className="py-3 px-4">
                  <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={() => onDelete(c.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No comments found</h3>
        <p className="text-gray-500 mb-4">Data will appear automatically.</p>
      </div>
    )}
  </div>
)

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

  useEffect(() => {
    localStorage.setItem('ADMIN_API_KEY', adminKey || '')
  }, [adminKey])

  const buildHeaders = (): HeadersInit => {
    const h: Record<string, string> = {}
    if (adminKey) h['X-Admin-Api-Key'] = adminKey
    return h
  }

  // Load initial data and poll periodically
  useEffect(() => {
    let timer: any;
    const loadAll = async () => {
      setRecipesLoading(true); setUsersLoading(true); setCommentsLoading(true);
      try {
        const [usersRes, recipesRes, commentsRes] = await Promise.all([
          fetch(`${API}/api/admin/users`, { headers: buildHeaders() }),
          fetch(`${API}/api/admin/recipes`, { headers: buildHeaders() }),
          fetch(`${API}/api/admin/comments`, { headers: buildHeaders() })
        ])
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
      } catch (e) {
      } finally {
        setRecipesLoading(false); setUsersLoading(false); setCommentsLoading(false);
      }
      timer = setTimeout(loadAll, 30000);
    }
    loadAll();
    return () => { if (timer) clearTimeout(timer) }
  }, [adminKey])

  const deleteComment = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/admin/comments/${id}`, { method: 'DELETE', headers: buildHeaders() })
      if (res.status === 204) setComments(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  // Load initial health and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        const healthRes = await fetch(`${API}/api/health`)
        if (healthRes.ok) setHealth(await healthRes.json()); else setHealth(null)
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
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${activeTab==='dashboard'?'bg-blue-500 text-white shadow-lg':'text-gray-700 hover:bg-gray-100'}`}>
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
            </button>
            <button onClick={() => setActiveTab('recipes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${activeTab==='recipes'?'bg-blue-500 text-white shadow-lg':'text-gray-700 hover:bg-gray-100'}`}>
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Recipes</span>}
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${activeTab==='users'?'bg-blue-500 text-white shadow-lg':'text-gray-700 hover:bg-gray-100'}`}>
              <Users className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Users</span>}
            </button>
            <button onClick={() => setActiveTab('comments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${activeTab==='comments'?'bg-blue-500 text-white shadow-lg':'text-gray-700 hover:bg-gray-100'}`}>
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Comments</span>}
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {!sidebarCollapsed && (
            <div className="space-y-2">
              <label className="text-xs text-gray-600">Admin API Key</label>
              <input value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="paste ADMIN_API_KEY" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          )}
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
            {activeTab === 'dashboard' && (
              <>
                <ServerStatus health={health} />
                <Statistics stats={stats} />
              </>
            )}
            {activeTab === 'recipes' && (
              <RecipesModule recipes={recipes} loading={recipesLoading} />
            )}
            {activeTab === 'users' && (
              <UsersModule users={users} loading={usersLoading} />
            )}
            {activeTab === 'comments' && (
              <CommentsModule comments={comments} loading={commentsLoading} onDelete={deleteComment} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}