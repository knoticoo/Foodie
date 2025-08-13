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
  User,
  Check,
  X,
  Github,
  Chrome,
  Facebook,
  Sparkles,
  Shield
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

const passwordRequirements = [
  { regex: /.{8,}/, text: 'Vismaz 8 simboli' },
  { regex: /[A-Z]/, text: 'Viens liels burts' },
  { regex: /[a-z]/, text: 'Viens mazs burts' },
  { regex: /\d/, text: 'Viens cipars' },
]

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const checkPasswordRequirement = (requirement: { regex: RegExp }) => {
    return requirement.regex.test(password)
  }

  const isPasswordValid = passwordRequirements.every(req => checkPasswordRequirement(req))
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isPasswordValid) {
      setError('Parole neatbilst prasībām')
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError('Paroles nesakrīt')
      setLoading(false)
      return
    }

    if (!agreeToTerms) {
      setError('Jāpiekrīt noteikumiem un nosacījumiem')
      setLoading(false)
      return
    }

    try {
      await register(email, password, name)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Neizdevās izveidot kontu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/2 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl shadow-xl mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            <span className="text-gradient-secondary">Pievienojieties</span>{' '}
            <span className="text-gradient-primary">mums</span>
          </h1>
          <p className="text-neutral-600">Sāciet savu kulināro ceļojumu</p>
        </motion.div>

        {/* Register Form */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="p-8 shadow-2xl">
            <CardHeader className="p-0 mb-6 text-center">
              <CardTitle className="text-2xl font-display font-bold">Izveidot kontu</CardTitle>
              <p className="text-neutral-600 mt-2">Reģistrējieties bezmaksas piekļuvei</p>
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
                    label="Pilns vārds"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jānis Bērziņš"
                    icon={<User className="w-5 h-5" />}
                    required
                    animated
                  />

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

                  <div className="space-y-2">
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
                        error={password.length > 0 && !isPasswordValid}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Requirements */}
                    {password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-neutral-50 rounded-lg p-3 space-y-2"
                      >
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {checkPasswordRequirement(req) ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                            <span className={cn(
                              checkPasswordRequirement(req) ? 'text-green-700' : 'text-red-600'
                            )}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      label="Apstiprināt paroli"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      icon={<Shield className="w-5 h-5" />}
                      required
                      animated
                      error={confirmPassword.length > 0 && !passwordsMatch}
                      errorMessage={confirmPassword.length > 0 && !passwordsMatch ? 'Paroles nesakrīt' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {confirmPassword.length > 0 && passwordsMatch && (
                      <div className="absolute right-10 top-[38px] text-green-500">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-1"
                    />
                    <span className="text-sm text-neutral-600 leading-relaxed">
                      Es piekrītu{' '}
                      <Link to="/terms" className="text-primary-600 hover:text-primary-700 transition-colors">
                        noteikumiem un nosacījumiem
                      </Link>
                      {' '}un{' '}
                      <Link to="/privacy" className="text-primary-600 hover:text-primary-700 transition-colors">
                        privātuma politikai
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-1"
                    />
                    <span className="text-sm text-neutral-600">
                      Vēlos saņemt e-pastus par jaunākajām receptēm un piedāvājumiem
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={!isPasswordValid || !passwordsMatch || !agreeToTerms}
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Izveidot kontu
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500">vai reģistrējieties ar</span>
                </div>
              </div>

              {/* Social Register */}
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

              {/* Login Link */}
              <div className="text-center mt-8 pt-6 border-t border-neutral-200">
                <p className="text-neutral-600">
                  Jau ir konts?{' '}
                  <Link 
                    to="/login" 
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Ieiet sistēmā
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
              { icon: ChefHat, text: 'Bezmaksas piekļuve' },
              { icon: Sparkles, text: 'Personalizēti ieteikumi' },
              { icon: Shield, text: 'Droša reģistrācija' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20"
              >
                <feature.icon className="w-5 h-5 mx-auto mb-1 text-secondary-500" />
                <p className="text-xs text-neutral-600">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}