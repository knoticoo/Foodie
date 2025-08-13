import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ChefHat, 
  ArrowRight,
  Github,
  Chrome,
  Facebook,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { cn } from '../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Neizdevās ieiet sistēmā')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-xl mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            <span className="text-gradient-primary">Virtuves</span>{' '}
            <span className="text-gradient-accent">Māksla</span>
          </h1>
          <p className="text-neutral-600">Ieejiet savā kontā</p>
        </motion.div>

        {/* Login Form */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="p-8 shadow-2xl">
            <CardHeader className="p-0 mb-6 text-center">
              <CardTitle className="text-2xl font-display font-bold">Ienākt sistēmā</CardTitle>
              <p className="text-neutral-600 mt-2">Turpiniet savu kulināro ceļojumu</p>
            </CardHeader>

            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <Input
                    label="E-pasta adrese"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jusu.epasts@example.com"
                    icon={<Mail className="w-5 h-5" />}
                    required
                    animated
                  />

                  <div className="relative">
                    <Input
                      label="Parole"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      icon={<Lock className="w-5 h-5" />}
                      required
                      animated
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-neutral-600">Atcerēties mani</span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Aizmirsta parole?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  fullWidth
                  loading={loading}
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Ieiet sistēmā
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500">vai turpiniet ar</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" size="sm" className="group">
                  <Chrome className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="outline" size="sm" className="group">
                  <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="outline" size="sm" className="group">
                  <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
              </div>

              {/* Register Link */}
              <div className="text-center mt-8 pt-6 border-t border-neutral-200">
                <p className="text-neutral-600">
                  Nav konta?{' '}
                  <Link 
                    to="/register" 
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Reģistrēties šeit
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: ChefHat, text: '10K+ Receptes' },
              { icon: Sparkles, text: 'AI Ieteikumi' },
              { icon: ArrowRight, text: 'Premium Saturs' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20"
              >
                <feature.icon className="w-5 h-5 mx-auto mb-1 text-primary-500" />
                <p className="text-xs text-neutral-600">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}