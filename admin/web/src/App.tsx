import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Users,
  BookOpen,
  Star,
  TrendingUp,
  Activity,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ChefHat,
  Crown,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Zap
} from 'lucide-react'
import { t, setLang, getLang } from './i18n'

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

// Card Component
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
    {children}
  </div>
)

// Button Component
const Button: React.FC<{
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  className?: string
}> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

// Stat Card Component
const StatCard: React.FC<{
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  color: string
}> = ({ title, value, change, changeType = 'neutral', icon, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="relative overflow-hidden"
  >
    <Card className="p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  </motion.div>
)

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [stats, setStats] = useState({
    total_users: 0,
    total_recipes: 0,
    total_comments: 0,
    total_ratings: 0
  })
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Recipes management state
  const [recipes, setRecipes] = useState<any[]>([])
  const [recipesLoading, setRecipesLoading] = useState(false)
  const [recipesError, setRecipesError] = useState<string | null>(null)
  const [recipeSearch, setRecipeSearch] = useState('')
  const [recipeStatusFilter, setRecipeStatusFilter] = useState('all')
  const [recipeSortBy, setRecipeSortBy] = useState('new')
  const [recipeLimit] = useState(20)
  const [recipeOffset, setRecipeOffset] = useState(0)
  const [recipeTotal, setRecipeTotal] = useState(0)
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<any>(null)
  const [viewingRecipe, setViewingRecipe] = useState<any>(null)

  // Users management state
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('all')
  const [userLimit] = useState(20)
  const [userOffset, setUserOffset] = useState(0)
  const [userTotal, setUserTotal] = useState(0)

  // Comments management state
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [commentSearch, setCommentSearch] = useState('')
  const [commentStatusFilter, setCommentStatusFilter] = useState('all')
  const [commentSortBy, setCommentSortBy] = useState('new')
  const [commentLimit] = useState(20)
  const [commentOffset, setCommentOffset] = useState(0)
  const [commentTotal, setCommentTotal] = useState(0)

  // Analytics state
  const [analytics, setAnalytics] = useState<any>({})
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'recipes', label: 'Receptes', icon: BookOpen },
    { id: 'users', label: 'Lietotāji', icon: Users },
    { id: 'comments', label: 'Komentāri', icon: MessageSquare },
    { id: 'analytics', label: 'Analītika', icon: TrendingUp },
    { id: 'settings', label: 'Iestatījumi', icon: Settings },
  ]

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
          headers: ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {}
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

  // Load recipes when filters change
  useEffect(() => {
    loadRecipes()
  }, [recipeSearch, recipeStatusFilter, recipeSortBy, recipeOffset])

  // Load users when filters change
  useEffect(() => {
    loadUsers()
  }, [userSearch, userStatusFilter, userOffset])

  // Load comments when filters change
  useEffect(() => {
    loadComments()
  }, [commentSearch, commentStatusFilter, commentSortBy, commentOffset])

  // Load analytics when component mounts
  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      // For now, we'll use the stats endpoint as a base for analytics
      const response = await fetch(`${API}/api/admin/stats`, {
        headers: ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {}
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics({
          totalViews: data.total_views || 0,
          activeUsers: data.total_users || 0,
          recipesThisMonth: data.total_recipes || 0,
          avgRating: data.avg_rating || 0
        })
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadRecipes = async () => {
    setRecipesLoading(true)
    setRecipesError(null)
    try {
      const params = new URLSearchParams({
        limit: recipeLimit.toString(),
        offset: recipeOffset.toString(),
        sortBy: recipeSortBy,
        ...(recipeSearch && { q: recipeSearch }),
        ...(recipeStatusFilter !== 'all' && { status: recipeStatusFilter })
      })
      
      const response = await fetch(`${API}/api/admin/recipes?${params}`, {
        headers: ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {}
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes || [])
        setRecipeTotal(data.total || data.recipes?.length || 0)
      } else {
        const errorText = response.statusText || 'Failed to load recipes'
        setRecipesError(errorText)
        console.error('Failed to load recipes:', errorText)
        setRecipes([])
        setRecipeTotal(0)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      setRecipesError(errorMessage)
      console.error('Error loading recipes:', error)
      setRecipes([])
      setRecipeTotal(0)
    } finally {
      setRecipesLoading(false)
    }
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const params = new URLSearchParams({
        limit: userLimit.toString(),
        offset: userOffset.toString(),
        ...(userSearch && { q: userSearch }),
        ...(userStatusFilter !== 'all' && { status: userStatusFilter })
      })
      
      const response = await fetch(`${API}/api/admin/users?${params}`, {
        headers: ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {}
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setUserTotal(data.total || data.users?.length || 0)
      } else {
        const errorText = response.statusText || 'Failed to load users'
        setUsersError(errorText)
        console.error('Failed to load users:', errorText)
        setUsers([])
        setUserTotal(0)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      setUsersError(errorMessage)
      console.error('Error loading users:', error)
      setUsers([])
      setUserTotal(0)
    } finally {
      setUsersLoading(false)
    }
  }

  const loadComments = async () => {
    setCommentsLoading(true)
    setCommentsError(null)
    try {
      const params = new URLSearchParams({
        limit: commentLimit.toString(),
        offset: commentOffset.toString(),
        sortBy: commentSortBy,
        ...(commentSearch && { q: commentSearch }),
        ...(commentStatusFilter !== 'all' && { status: commentStatusFilter })
      })
      
      const response = await fetch(`${API}/api/admin/comments?${params}`, {
        headers: ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {}
      })
      
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
        setCommentTotal(data.total || data.comments?.length || 0)
      } else {
        const errorText = response.statusText || 'Failed to load comments'
        setCommentsError(errorText)
        console.error('Failed to load comments:', errorText)
        setComments([])
        setCommentTotal(0)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      setCommentsError(errorMessage)
      console.error('Error loading comments:', error)
      setComments([])
      setCommentTotal(0)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleViewRecipe = (recipe: any) => {
    setViewingRecipe(recipe)
  }

  const handleEditRecipe = (recipe: any) => {
    setEditingRecipe(recipe)
  }

  const handleApproveRecipe = async (recipeId: string) => {
    try {
      const response = await fetch(`${API}/api/admin/recipes/${recipeId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {})
        },
        body: JSON.stringify({ isApproved: true })
      })
      
      if (response.ok) {
        // Show success feedback
        alert('Recepte veiksmīgi apstiprināta!')
        // Reload recipes to reflect changes
        loadRecipes()
      } else {
        console.error('Failed to approve recipe')
        alert('Kļūda apstiprinot recepti')
      }
    } catch (error) {
      console.error('Error approving recipe:', error)
      alert('Kļūda apstiprinot recepti')
    }
  }

  const handleRejectRecipe = async (recipeId: string) => {
    try {
      const response = await fetch(`${API}/api/admin/recipes/${recipeId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {})
        },
        body: JSON.stringify({ isApproved: false })
      })
      
      if (response.ok) {
        // Show success feedback
        alert('Recepte veiksmīgi noraidīta!')
        // Reload recipes to reflect changes
        loadRecipes()
      } else {
        console.error('Failed to reject recipe')
        alert('Kļūda noraidot recepti')
      }
    } catch (error) {
      console.error('Error rejecting recipe:', error)
      alert('Kļūda noraidot recepti')
    }
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo recepti? Šo darbību nevar atsaukt.')) {
      return
    }
    
    try {
      const response = await fetch(`${API}/api/admin/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {}
      })
      
      if (response.ok) {
        // Show success feedback
        alert('Recepte veiksmīgi dzēsta!')
        // Reload recipes to reflect changes
        loadRecipes()
      } else {
        console.error('Failed to delete recipe')
        alert('Kļūda dzēšot recepti')
      }
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('Kļūda dzēšot recepti')
    }
  }

  const handleTogglePremium = async (user: any) => {
    try {
      const response = await fetch(`${API}/api/admin/users/${user.id}/premium`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {})
        },
        body: JSON.stringify({ isPremium: !user.is_premium })
      })
      
      if (response.ok) {
        // Show success feedback
        alert(`Premium statuss veiksmīgi ${!user.is_premium ? 'ieslēgts' : 'izslēgts'}!`)
        loadUsers()
      } else {
        console.error('Failed to toggle premium status')
        alert('Kļūda mainot premium statusu')
      }
    } catch (error) {
      console.error('Error toggling premium status:', error)
      alert('Kļūda mainot premium statusu')
    }
  }

  const handleToggleAdmin = async (user: any) => {
    try {
      const response = await fetch(`${API}/api/admin/users/${user.id}/admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {})
        },
        body: JSON.stringify({ isAdmin: !user.is_admin })
      })
      
      if (response.ok) {
        // Show success feedback
        alert(`Admin statuss veiksmīgi ${!user.is_admin ? 'piešķirts' : 'atņemts'}!`)
        loadUsers()
      } else {
        console.error('Failed to toggle admin status')
        alert('Kļūda mainot admin statusu')
      }
    } catch (error) {
      console.error('Error toggling admin status:', error)
      alert('Kļūda mainot admin statusu')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo komentāru? Šo darbību nevar atsaukt.')) {
      return
    }

    try {
      const response = await fetch(`${API}/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {}
      })

      if (response.ok) {
        // Show success feedback
        alert('Komentārs veiksmīgi dzēsts!')
        // Reload comments to reflect changes
        loadComments()
      } else {
        console.error('Failed to delete comment')
        alert('Kļūda dzēšot komentāru')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Kļūda dzēšot komentāru')
    }
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Laipni lūdzam Virtuves Māksla admin panelī</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Eksportēt datus
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Jauna recepte
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Kopā lietotāju"
          value={stats.total_users?.toLocaleString() || '0'}
          change="+12% šomēnes"
          changeType="positive"
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Kopā receptu"
          value={stats.total_recipes?.toLocaleString() || '0'}
          change="+8% šomēnes"
          changeType="positive"
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Komentāri"
          value={stats.total_comments?.toLocaleString() || '0'}
          change="+23% šomēnes"
          changeType="positive"
          icon={<MessageSquare className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Vērtējumi"
          value={stats.total_ratings?.toLocaleString() || '0'}
          change="+15% šomēnes"
          changeType="positive"
          icon={<Star className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Aktivitāte</h3>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Diagramma būs pieejama drīzumā</p>
            </div>
          </div>
        </Card>

        {/* Recent Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Jaunākās darbības</h3>
          <div className="space-y-4">
            {[
              { action: 'Jauna recepte pievienota', user: 'Jānis Bērziņš', time: 'Pirms 5 min', type: 'success' },
              { action: 'Komentārs moderēts', user: 'Admin', time: 'Pirms 12 min', type: 'warning' },
              { action: 'Lietotājs reģistrējies', user: 'Anna Zariņa', time: 'Pirms 1h', type: 'info' },
              { action: 'Recepte dzēsta', user: 'Admin', time: 'Pirms 2h', type: 'danger' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'success' ? 'bg-green-500' :
                  item.type === 'warning' ? 'bg-yellow-500' :
                  item.type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.user} • {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Health */}
      {health && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistēmas stāvoklis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-900">API</p>
                <p className="text-xs text-gray-500">Darbojas normāli</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-900">Datubāze</p>
                <p className="text-xs text-gray-500">Savienots</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-900">Atbilde</p>
                <p className="text-xs text-gray-500">{health.durationMs || 0}ms</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'recipes':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Receptes</h1>
              <Button variant="primary" onClick={() => setShowAddRecipeModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Pievienot recepti
              </Button>
            </div>
            
            {/* Search and Filters */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Meklēt receptes..."
                      value={recipeSearch}
                      onChange={(e) => setRecipeSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <select
                  value={recipeStatusFilter}
                  onChange={(e) => setRecipeStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Visas receptes</option>
                  <option value="approved">Apstiprinātas</option>
                  <option value="pending">Gaidīšanā</option>
                </select>
                <select
                  value={recipeSortBy}
                  onChange={(e) => setRecipeSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="new">Jaunākās</option>
                  <option value="top">Populārākās</option>
                </select>
              </div>
            </Card>

            {/* Recipes Table */}
            <Card className="p-6">
              {recipesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-gray-600">Ielādē receptes...</span>
                </div>
              ) : recipesError ? (
                <div className="text-center py-12 text-red-600">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <p>{recipesError}</p>
                </div>
              ) : recipes.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nav atrastas receptes</h3>
                  <p className="text-gray-600">Mēģiniet mainīt meklēšanas kritērijus vai pievienot jaunu recepti.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Recepte</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Statuss</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Vērtējums</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Datums</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Darbības</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recipes.map((recipe) => (
                        <tr key={recipe.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {recipe.cover_image ? (
                                <img
                                  src={`${STATIC_BASE}/uploads/${recipe.cover_image}`}
                                  alt={recipe.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {recipe.description || 'Nav apraksta'}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                  <span>{recipe.servings || 2} porcijas</span>
                                  {recipe.total_time_minutes && (
                                    <span>{recipe.total_time_minutes} min</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {recipe.is_approved ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Apstiprināta
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Gaidīšanā
                                </span>
                              )}
                              {recipe.is_sponsored && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Sponsorēta
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {recipe.avg_rating ? (
                                <>
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="ml-1 text-sm font-medium text-gray-900">
                                      {Number(recipe.avg_rating).toFixed(1)}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    ({recipe.rating_count || 0})
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-500">Nav vērtējumu</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(recipe.created_at).toLocaleDateString('lv-LV')}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewRecipe(recipe)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRecipe(recipe)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              {!recipe.is_approved ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproveRecipe(recipe.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRejectRecipe(recipe.id)}
                                  className="text-yellow-600 hover:text-yellow-700"
                                >
                                  <Clock className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecipe(recipe.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {recipes.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Rāda {recipeOffset + 1}-{Math.min(recipeOffset + recipes.length, recipeTotal)} no {recipeTotal} receptēm
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRecipeOffset(Math.max(0, recipeOffset - recipeLimit))}
                      disabled={recipeOffset === 0}
                    >
                      Iepriekšējā
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRecipeOffset(recipeOffset + recipeLimit)}
                      disabled={recipeOffset + recipeLimit >= recipeTotal}
                    >
                      Nākamā
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Lietotāji</h1>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Eksportēt
                </Button>
              </div>
            </div>
            
            {/* Search and Filters */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Meklēt lietotājus..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Visi lietotāji</option>
                  <option value="new">Jauni (7 dienas)</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </Card>

            {/* Users Table */}
            <Card className="p-6">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-gray-600">Ielādē lietotājus...</span>
                </div>
              ) : usersError ? (
                <div className="text-center py-12 text-red-600">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <p>{usersError}</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nav atrasti lietotāji</h3>
                  <p className="text-gray-600">Mēģiniet mainīt meklēšanas kritērijus.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">E-pasts</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Statuss</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Reģistrējies</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Darbības</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {user.is_admin && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {user.is_premium ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Premium
                                  {user.premium_expires_at && (
                                    <span className="ml-1 text-xs">
                                      ({new Date(user.premium_expires_at).toLocaleDateString('lv-LV')})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <Users className="w-3 h-3 mr-1" />
                                  Standarta
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString('lv-LV')}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePremium(user)}
                                className={user.is_premium ? "text-gray-600" : "text-yellow-600"}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleAdmin(user)}
                                className={user.is_admin ? "text-red-600" : "text-gray-600"}
                              >
                                <Crown className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {users.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Rāda {userOffset + 1}-{Math.min(userOffset + users.length, userTotal)} no {userTotal} lietotājiem
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setUserOffset(Math.max(0, userOffset - userLimit))}
                      disabled={userOffset === 0}
                    >
                      Iepriekšējā
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setUserOffset(userOffset + userLimit)}
                      disabled={userOffset + userLimit >= userTotal}
                    >
                      Nākamā
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )
      case 'comments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Komentāri</h1>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Eksportēt
                </Button>
              </div>
            </div>
            
            {/* Comments List */}
            <Card className="p-6">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-gray-600">Ielādē komentārus...</span>
                </div>
              ) : commentsError ? (
                <div className="text-center py-12 text-red-600">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <p>{commentsError}</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nav komentāru</h3>
                  <p className="text-gray-600">Nav atrasti komentāri moderēšanai.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{comment.email}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString('lv-LV')}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">
                              Recepte: {comment.recipe_title}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRecipe({ id: comment.recipe_id })}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Analītika</h1>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Eksportēt
                </Button>
              </div>
            </div>
            
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Kopā skatījumi</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.totalViews?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aktīvi lietotāji</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.activeUsers?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Receptes šomēnes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.recipesThisMonth?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vidējais vērtējums</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.avgRating ? Number(analytics.avgRating).toFixed(1) : '0.0'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Lietotāju aktivitāte</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Diagramma būs pieejama drīzumā</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Populārākās receptes</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Top receptes būs pieejamas drīzumā</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Jaunākās darbības</h3>
              <div className="space-y-4">
                {[
                  { action: 'Jauna recepte pievienota', user: 'Jānis Bērziņš', time: 'Pirms 5 min', type: 'success' },
                  { action: 'Komentārs moderēts', user: 'Admin', time: 'Pirms 12 min', type: 'warning' },
                  { action: 'Lietotājs reģistrējies', user: 'Anna Zariņa', time: 'Pirms 1h', type: 'info' },
                  { action: 'Recepte dzēsta', user: 'Admin', time: 'Pirms 2h', type: 'danger' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'success' ? 'bg-green-500' :
                      item.type === 'warning' ? 'bg-yellow-500' :
                      item.type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.action}</p>
                      <p className="text-xs text-gray-500">{item.user} • {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Iestatījumi</h1>
            </div>
            
            {/* System Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sistēmas iestatījumi</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Automatiskā receptu apstiprināšana</h4>
                    <p className="text-sm text-gray-600">Automātiski apstiprināt jaunas receptes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">E-pasta paziņojumi</h4>
                    <p className="text-sm text-gray-600">Sūtīt paziņojumus par jaunām receptēm</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Moderācijas režīms</h4>
                    <p className="text-sm text-gray-600">Iespējot stingrāku komentāru moderāciju</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </Card>

            {/* API Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">API konfigurācija</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API bāzes URL
                  </label>
                  <input
                    type="text"
                    value={API}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statiskā failu URL
                  </label>
                  <input
                    type="text"
                    value={STATIC_BASE}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin API atslēga
                  </label>
                  <input
                    type="password"
                    value={ADMIN_API_KEY ? '••••••••••••••••' : 'Nav iestatīta'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </Card>

            {/* Backup & Export */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Datu pārvaldība</h3>
              <div className="space-y-4">
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Eksportēt visus datus
                </Button>
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Eksportēt receptes
                </Button>
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Eksportēt lietotājus
                </Button>
              </div>
            </Card>
          </div>
        )
      default:
        return (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sadaļa izstrādes procesā</h2>
            <p className="text-gray-600">Šī funkcionalitāte būs pieejama drīzumā.</p>
          </Card>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Ielādē admin paneli...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="font-bold text-gray-900">Virtuves Māksla</h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => window.open(PUBLIC_WEB_BASE, '_blank')}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">Publiskā lapa</span>}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">Iziet</span>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Activity className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Meklēt..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Admin</p>
                  <p className="text-gray-500">Administrators</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}