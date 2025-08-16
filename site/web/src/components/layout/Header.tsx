import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChefHat, 
  Search, 
  Heart, 
  User, 
  Menu, 
  X, 
  Crown, 
  Calendar,
  Settings,
  LogOut,
  Star,
  Award,
  ShoppingCart,
  BookOpen,
  Zap
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const ADMIN_WEB_URL = (import.meta as any).env?.VITE_ADMIN_WEB_URL || (window as any).__VITE__?.VITE_ADMIN_WEB_URL || `http://${window.location.hostname}:5173/`

const menuVariants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

const mobileMenuVariants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export const Header: React.FC = () => {
  const { token, isAdmin, isPremium, userName, userEmail, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [accountOpen, setAccountOpen] = React.useState(false)
  const [discoverOpen, setDiscoverOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setAccountOpen(false)
        setDiscoverOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
        setDiscoverOpen(false)
      }
    }
    document.addEventListener('click', onClickOutside)
    return () => document.removeEventListener('click', onClickOutside)
  }, [])

  const navLinks = [
    { href: "/recipes", label: "Receptes", icon: BookOpen },
    { href: "/prices", label: "Cenas", icon: ShoppingCart },
    { href: "/challenges", label: "Izaicinājumi", icon: Award },
  ]

  const accountLinks = [
    { href: "/profile", label: "Profils", icon: User },
    { href: "/favorites", label: "Iecienītās", icon: Heart },
    { href: "/recommendations", label: "Tavām gaumēm", icon: Star },
    { href: "/submit", label: "Pievienot recepti", icon: Zap },
  ]

  return (
    <motion.header 
      className="sticky top-0 z-50 glass border-b border-white/20 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div ref={containerRef} className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-xl bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                  Virtuves Māksla
                </h1>
                <p className="text-xs text-neutral-500 -mt-1">Latvijas receptu platforma</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.div key={link.href} whileHover={{ y: -2 }}>
                <Link
                  to={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 group"
                >
                  <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {link.label}
                </Link>
              </motion.div>
            ))}
            
            {/* Premium Link */}
            <motion.div whileHover={{ y: -2 }}>
              <Link
                to="/billing"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group",
                  isPremium 
                    ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200" 
                    : "text-neutral-600 hover:text-primary-600 hover:bg-primary-50"
                )}
              >
                <Crown className={cn("w-4 h-4 transition-transform group-hover:scale-110", isPremium && "text-amber-600")} />
                Premium
                {isPremium && <span className="text-xs bg-amber-200 px-2 py-1 rounded-full">✓</span>}
              </Link>
            </motion.div>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors">
                <Search className="w-4 h-4" />
                <span className="text-sm">Meklēt...</span>
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-white rounded border">⌘K</kbd>
              </button>
            </motion.div>

            {/* Auth Section */}
            {token ? (
              <div className="hidden md:block relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-100 transition-colors group relative"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* User Badges */}
                    <div className="absolute -top-1 -right-1 flex gap-1">
                      {isAdmin && (
                        <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center" title="Administrator">
                          <Shield className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      {isPremium && (
                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center" title="Premium Member">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-700">{userName || 'Profile'}</span>
                      <div className="flex gap-1">
                        {isAdmin && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Admin</span>
                        )}
                        {isPremium && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Premium</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: accountOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 text-neutral-400"
                  >
                    ▼
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      variants={menuVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-secondary-50">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            
                            {/* Small badges on profile picture */}
                            <div className="absolute -top-1 -right-1 flex gap-1">
                              {isAdmin && (
                                <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                                  <Shield className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                              {isPremium && (
                                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <Crown className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-neutral-900">{userName || 'Mans Konts'}</p>
                              
                              {/* Status badges */}
                              <div className="flex gap-1">
                                {isAdmin && (
                                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-md font-medium">Admin</span>
                                )}
                                {isPremium && (
                                  <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-md font-medium">Premium</span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-neutral-600">{userEmail || 'Pārvaldīt profilu'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        {accountLinks.map((link) => (
                          <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors group"
                          >
                            <link.icon className="w-4 h-4 text-neutral-500 group-hover:text-primary-500 transition-colors" />
                            <span className="text-neutral-700 group-hover:text-neutral-900">{link.label}</span>
                          </Link>
                        ))}
                        
                        {isAdmin && (
                          <a
                            href={`${ADMIN_WEB_URL}${token ? `?token=${encodeURIComponent(token)}` : ''}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors group"
                          >
                            <Settings className="w-4 h-4 text-neutral-500 group-hover:text-primary-500 transition-colors" />
                            <span className="text-neutral-700 group-hover:text-neutral-900">Admin Panel</span>
                          </a>
                        )}
                        
                        <hr className="my-2 border-neutral-100" />
                        
                        <button
                          onClick={() => { setAccountOpen(false); logout() }}
                          className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-red-50 transition-colors group"
                        >
                          <LogOut className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors" />
                          <span className="text-neutral-700 group-hover:text-red-600">Iziet</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Ieiet</Link>
                </Button>
                <Button variant="gradient" size="sm" asChild>
                  <Link to="/register">Reģistrēties</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden border-t border-white/20 overflow-hidden"
            >
              <div className="py-6 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        <link.icon className="w-5 h-5 text-primary-500" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                  >
                    <Link
                      to="/billing"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <Crown className="w-5 h-5 text-amber-500" />
                      <span className="font-medium">Premium</span>
                      {isPremium && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">✓</span>}
                    </Link>
                  </motion.div>
                </div>

                {/* Mobile Auth Section */}
                {token ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border-t border-neutral-200 pt-4 space-y-2"
                  >
                    {accountLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        <link.icon className="w-5 h-5 text-neutral-500" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                    
                    <button
                      onClick={() => { setMobileOpen(false); logout() }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <span className="text-red-600">Iziet</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border-t border-neutral-200 pt-4 flex flex-col gap-3"
                  >
                    <Button variant="outline" fullWidth asChild>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>Ieiet</Link>
                    </Button>
                    <Button variant="gradient" fullWidth asChild>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>Reģistrēties</Link>
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}