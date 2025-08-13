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
  const [adminUser, setAdminUser] = useState<{name?: string, email?: string} | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersSortBy, setUsersSortBy] = useState<'name' | 'email' | 'created_at' | 'status'>('created_at')
  const [usersSortDirection, setUsersSortDirection] = useState<'asc' | 'desc'>('desc')

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

        // Try to get user info from URL token parameter
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        if (token) {
          try {
            const userRes = await fetch(`${API}/api/auth/me`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (userRes.ok) {
              const userData = await userRes.json()
              setAdminUser({
                name: userData.name || userData.full_name,
                email: userData.email
              })
            }
          } catch (err) {
            console.warn('Failed to load user info:', err)
          }
        }
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
        headers: ADMIN_API_KEY ? { 'X-Admin-Key': ADMIN_API_KEY } : {}
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(Array.isArray(data) ? data : data.users || [])
      } else {
        console.error('Failed to load users:', response.status)
        setUsers([])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  // Sort users function
  const sortUsers = (field: 'name' | 'email' | 'created_at' | 'status') => {
    let direction: 'asc' | 'desc' = 'asc'
    if (usersSortBy === field && usersSortDirection === 'asc') {
      direction = 'desc'
    }
    setUsersSortBy(field)
    setUsersSortDirection(direction)
  }

  // Get sorted users
  const getSortedUsers = () => {
    return [...users].sort((a, b) => {
      let aValue = '', bValue = ''
      
      switch (usersSortBy) {
        case 'name':
          aValue = (a.name || a.full_name || '').toLowerCase()
          bValue = (b.name || b.full_name || '').toLowerCase()
          break
        case 'email':
          aValue = (a.email || '').toLowerCase()
          bValue = (b.email || '').toLowerCase()
          break
        case 'created_at':
          aValue = a.created_at || ''
          bValue = b.created_at || ''
          break
        case 'status':
          aValue = a.is_admin ? 'admin' : a.is_premium ? 'premium' : 'active'
          bValue = b.is_admin ? 'admin' : b.is_premium ? 'premium' : 'active'
          break
      }
      
      if (usersSortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
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
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtri
                </Button>
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Pievienot recepti
                </Button>
              </div>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Receptu saraksts</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Kārtot pēc:</span>
                    <select className="border border-gray-300 rounded px-2 py-1">
                      <option value="created_at">Pievienošanas datuma</option>
                      <option value="title">Nosaukuma</option>
                      <option value="rating">Vērtējuma</option>
                      <option value="views">Skatījumu skaita</option>
                    </select>
                  </div>
                </div>
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Receptu pārvaldības sadaļa būs pieejama drīzumā</p>
                  <p className="text-sm text-gray-500">Šeit varēsiet pārvaldīt visas receptes, to statusu un saturu</p>
                </div>
              </div>
            </Card>
          </div>
        )
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Lietotāji</h1>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={loadUsers}>
                  <Download className="w-4 h-4 mr-2" />
                  Atjaunot
                </Button>
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Eksportēt
                </Button>
              </div>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-3" />
                    <span className="text-gray-600">Ielādē lietotājus...</span>
                  </div>
                ) : users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">ID</th>
                          <th 
                            scope="col" 
                            className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => sortUsers('name')}
                          >
                            <div className="flex items-center gap-1">
                              Vārds
                              {usersSortBy === 'name' && (
                                <span className="text-primary-600">
                                  {usersSortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th 
                            scope="col" 
                            className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => sortUsers('email')}
                          >
                            <div className="flex items-center gap-1">
                              E-pasts
                              {usersSortBy === 'email' && (
                                <span className="text-primary-600">
                                  {usersSortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th 
                            scope="col" 
                            className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => sortUsers('created_at')}
                          >
                            <div className="flex items-center gap-1">
                              Reģistrācijas datums
                              {usersSortBy === 'created_at' && (
                                <span className="text-primary-600">
                                  {usersSortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th 
                            scope="col" 
                            className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => sortUsers('status')}
                          >
                            <div className="flex items-center gap-1">
                              Statuss
                              {usersSortBy === 'status' && (
                                <span className="text-primary-600">
                                  {usersSortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3">Darbības</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedUsers().map((user, index) => (
                          <tr key={user.id || index} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{user.id}</td>
                            <td className="px-6 py-4">{user.name || user.full_name || 'Nav norādīts'}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">{user.created_at ? new Date(user.created_at).toLocaleDateString('lv-LV') : 'Nav zināms'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${user.is_admin ? 'bg-red-100 text-red-800' : user.is_premium ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {user.is_admin ? 'Admin' : user.is_premium ? 'Premium' : 'Aktīvs'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Nav atrasti lietotāji</p>
                    <Button variant="primary" size="sm" onClick={loadUsers}>
                      Ielādēt lietotājus
                    </Button>
                  </div>
                )}
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
                  <span className="text-white text-sm font-medium">
                    {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{adminUser?.name || 'Admin'}</p>
                  <p className="text-gray-500">{adminUser?.email || 'Administrators'}</p>
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