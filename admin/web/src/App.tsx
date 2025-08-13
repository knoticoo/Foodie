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
  Zap,
  PieChart,
  RefreshCw,
  Menu,
  X,
  Lock
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

// Module Components
const ModuleCard: React.FC<{
  title: string
  description: string
  icon: React.ReactNode
  color: string
  onClick?: () => void
  actions?: React.ReactNode
}> = ({ title, description, icon, color, onClick, actions }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer group"
    onClick={onClick}
  >
    <div className={`h-2 ${color}`} />
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color.replace('bg-', 'bg-').replace('-500', '-100')} group-hover:scale-110 transition-transform`}>
          <div className={color.replace('bg-', 'text-')}>
            {icon}
          </div>
        </div>
        {actions && (
          <div onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </motion.div>
)

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

// Stat Card Component
const StatCard: React.FC<{
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  color: string
  trend?: number[]
}> = ({ title, value, change, changeType = 'neutral', icon, color, trend }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.02 }}
    className="relative overflow-hidden"
  >
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color} shadow-lg`}>
          <div className="text-white w-6 h-6">
            {icon}
          </div>
        </div>
      </div>
      {trend && (
        <div className="mt-4 h-12 flex items-end gap-1">
          {trend.map((value, index) => (
            <div
              key={index}
              className={`w-2 ${color.replace('bg-gradient-to-r from-', 'bg-').replace(' to-blue-600', '')} rounded-t opacity-60`}
              style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  </motion.div>
)

// Quick Action Card
const QuickActionCard: React.FC<{
  title: string
  description: string
  icon: React.ReactNode
  color: string
  onClick: () => void
}> = ({ title, description, icon, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="w-full text-left bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-lg ${color}`}>
        <div className="text-white w-5 h-5">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </motion.button>
)

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
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
  const [adminUser, setAdminUser] = useState<{name?: string, email?: string} | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Pārvaldes panelis', icon: BarChart3, color: 'bg-blue-500' },
    { id: 'recipes', label: 'Receptes', icon: BookOpen, color: 'bg-green-500' },
    { id: 'users', label: 'Lietotāji', icon: Users, color: 'bg-purple-500' },
    { id: 'comments', label: 'Komentāri', icon: MessageSquare, color: 'bg-yellow-500' },
    { id: 'analytics', label: 'Analītika', icon: PieChart, color: 'bg-pink-500' },
    { id: 'settings', label: 'Iestatījumi', icon: Settings, color: 'bg-gray-500' },
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
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Pārvaldes Panelis</h1>
          <p className="text-gray-600 mt-2">Laipni lūdzam Virtuves Māksla admin panelī</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="md" icon={<Download className="w-4 h-4" />}>
            Eksportēt datus
          </Button>
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
            Jauna recepte
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Kopā lietotāju"
          value={stats.total_users?.toLocaleString() || '0'}
          change="+12% šomēnes"
          changeType="positive"
          icon={<Users className="w-6 h-6" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend={[65, 72, 68, 85, 91, 88, 95]}
        />
        <StatCard
          title="Kopā receptu"
          value={stats.total_recipes?.toLocaleString() || '0'}
          change="+8% šomēnes"
          changeType="positive"
          icon={<BookOpen className="w-6 h-6" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend={[45, 52, 48, 65, 71, 68, 75]}
        />
        <StatCard
          title="Komentāri"
          value={stats.total_comments?.toLocaleString() || '0'}
          change="+23% šomēnes"
          changeType="positive"
          icon={<MessageSquare className="w-6 h-6" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          trend={[25, 32, 28, 45, 51, 48, 55]}
        />
        <StatCard
          title="Vērtējumi"
          value={stats.total_ratings?.toLocaleString() || '0'}
          change="+15% šomēnes"
          changeType="positive"
          icon={<Star className="w-6 h-6" />}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
          trend={[35, 42, 38, 55, 61, 58, 65]}
        />
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sistēmas moduļi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModuleCard
            title="Receptu pārvaldība"
            description="Pārvaldiet receptes, to statusu un saturu"
            icon={<BookOpen className="w-6 h-6" />}
            color="bg-green-500"
            onClick={() => setActiveTab('recipes')}
            actions={
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                <Button variant="ghost" size="sm" icon={<Edit3 className="w-4 h-4" />} />
              </div>
            }
          />
          <ModuleCard
            title="Lietotāju pārvaldība"
            description="Pārvaldiet lietotāju kontus un tiesības"
            icon={<Users className="w-6 h-6" />}
            color="bg-purple-500"
            onClick={() => setActiveTab('users')}
            actions={
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={() => { loadUsers(); }} />
                <Button variant="ghost" size="sm" icon={<Plus className="w-4 h-4" />} />
              </div>
            }
          />
          <ModuleCard
            title="Komentāru moderācija"
            description="Moderējiet un pārvaldiet lietotāju komentārus"
            icon={<MessageSquare className="w-6 h-6" />}
            color="bg-yellow-500"
            onClick={() => setActiveTab('comments')}
            actions={
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<AlertCircle className="w-4 h-4" />} />
                <Button variant="ghost" size="sm" icon={<CheckCircle className="w-4 h-4" />} />
              </div>
            }
          />
          <ModuleCard
            title="Analītika un atskaites"
            description="Skatiet detalizētu analītiku un ģenerējiet atskaites"
            icon={<PieChart className="w-6 h-6" />}
            color="bg-pink-500"
            onClick={() => setActiveTab('analytics')}
            actions={
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />} />
                <Button variant="ghost" size="sm" icon={<TrendingUp className="w-4 h-4" />} />
              </div>
            }
          />
          <ModuleCard
            title="Sistēmas iestatījumi"
            description="Konfigurējiet sistēmas parametrus un iestatījumus"
            icon={<Settings className="w-6 h-6" />}
            color="bg-gray-500"
            onClick={() => setActiveTab('settings')}
            actions={
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<Zap className="w-4 h-4" />} />
                <Button variant="ghost" size="sm" icon={<Lock className="w-4 h-4" />} />
              </div>
            }
          />
          <ModuleCard
            title="Sistēmas stāvoklis"
            description="Monitorējiet sistēmas veiktspēju un stāvokli"
            icon={<Activity className="w-6 h-6" />}
            color="bg-indigo-500"
            onClick={() => {}}
            actions={
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Aktīvs</span>
              </div>
            }
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ātrās darbības</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Pievienot recepti"
            description="Izveidojiet jaunu recepti"
            icon={<Plus className="w-5 h-5" />}
            color="bg-green-500"
            onClick={() => {}}
          />
          <QuickActionCard
            title="Eksportēt datus"
            description="Lejupielādējiet sistēmas datus"
            icon={<Download className="w-5 h-5" />}
            color="bg-blue-500"
            onClick={() => {}}
          />
          <QuickActionCard
            title="Sistēmas atskaite"
            description="Ģenerējiet ikmēneša atskaiti"
            icon={<BarChart3 className="w-5 h-5" />}
            color="bg-purple-500"
            onClick={() => {}}
          />
          <QuickActionCard
            title="Rezerves kopija"
            description="Izveidojiet datu rezerves kopiju"
            icon={<Crown className="w-5 h-5" />}
            color="bg-yellow-500"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* System Health */}
      {health && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Sistēmas stāvoklis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">API Serveris</p>
                <p className="text-xs text-gray-500">Darbojas normāli</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">Datubāze</p>
                <p className="text-xs text-gray-500">Savienots</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">Atbilnes laiks</p>
                <p className="text-xs text-gray-500">{health.durationMs || 0}ms</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Lietotāji</h1>
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={loadUsers}
                  loading={usersLoading}
                >
                  Atjaunot
                </Button>
                <Button 
                  variant="secondary" 
                  icon={<Download className="w-4 h-4" />}
                >
                  Eksportēt
                </Button>
                <Button 
                  variant="primary" 
                  icon={<Plus className="w-4 h-4" />}
                >
                  Pievienot lietotāju
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Ielādē lietotājus...</p>
                  </div>
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Lietotājs</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">E-pasts</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Statuss</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Reģistrācija</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Darbības</th>
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
                                {user.name || user.full_name || 'Nav norādīts'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{user.email}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                              user.is_admin ? 'bg-red-100 text-red-800' : 
                              user.is_premium ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.is_admin && <Crown className="w-3 h-3" />}
                              {user.is_admin ? 'Admin' : user.is_premium ? 'Premium' : 'Aktīvs'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600 text-sm">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('lv-LV') : 'Nav zināms'}
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
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Nav atrasti lietotāji</h3>
                  <p className="text-gray-500 mb-6">Uzsāciet, ielādējot lietotāju sarakstu</p>
                  <Button variant="primary" onClick={loadUsers} icon={<RefreshCw className="w-4 h-4" />}>
                    Ielādēt lietotājus
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sadaļa izstrādes procesā</h2>
            <p className="text-gray-600 mb-6">Šī funkcionalitāte būs pieejama drīzumā</p>
            <Button variant="primary" onClick={() => setActiveTab('dashboard')}>
              Atgriezties uz pārvaldes paneli
            </Button>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ielādē admin paneli...</h2>
          <p className="text-gray-600">Lūdzu uzgaidiet</p>
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
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(item.id)
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === item.id
                  ? `${item.color} text-white shadow-lg`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </motion.button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => window.open(PUBLIC_WEB_BASE, '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Publiskā lapa</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Iziet</span>}
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
              <div className="relative hidden md:block">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Meklēt..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <div className="text-sm hidden md:block">
                  <p className="font-medium text-gray-900">{adminUser?.name || 'Admin'}</p>
                  <p className="text-gray-500">{adminUser?.email || 'admin@virtuves-maksla.lv'}</p>
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
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}