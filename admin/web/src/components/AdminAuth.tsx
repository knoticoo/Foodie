import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChefHat, Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'

// Environment variables - same as main site
const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase

interface AdminAuthProps {
  onLogin: (token: string, userInfo: any) => void
  loading?: boolean
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onLogin, loading }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Lūdzu, ievadiet e-pastu un paroli')
      return
    }

    setIsSubmitting(true)
    setError('')
    
    try {
      // Step 1: Login with email and password
      const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!loginRes.ok) {
        const errorData = await loginRes.json().catch(() => ({ error: 'Nezināma kļūda' }))
        throw new Error(errorData.error || 'Nepareizi piekļuves dati')
      }
      
      const { token } = await loginRes.json()
      
      // Step 2: Check if user has admin privileges
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!meRes.ok) {
        throw new Error('Neizdevās pārbaudīt lietotāja datus')
      }
      
      const userInfo = await meRes.json()
      
      if (!userInfo.is_admin) {
        throw new Error('Jums nav administratora tiesību. Sazinieties ar sistēmas administratoru.')
      }
      
      // Success - user is authenticated and has admin privileges
      onLogin(token, userInfo)
      
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Pieslēgšanās neizdevās')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}
          >
            <ChefHat size={40} color="white" />
          </motion.div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            Virtuves Māksla
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            margin: '0'
          }}>
            Admin Panelis
          </p>
        </div>

                 {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              E-pasta adrese
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                zIndex: 1
              }}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                style={{
                  width: '100%',
                  padding: '12px 44px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Parole
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                zIndex: 1
              }}>
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ievadiet paroli..."
                style={{
                  width: '100%',
                  padding: '12px 48px 12px 44px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} color="#dc2626" />
              <span style={{ color: '#dc2626', fontSize: '14px' }}>{error}</span>
            </motion.div>
          )}

                     {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!email.trim() || !password.trim() || isSubmitting || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '14px',
              background: email.trim() && password.trim() && !isSubmitting && !loading 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#e5e7eb',
              color: email.trim() && password.trim() && !isSubmitting && !loading ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: email.trim() && password.trim() && !isSubmitting && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: email.trim() && password.trim() && !isSubmitting && !loading 
                ? '0 4px 15px rgba(102, 126, 234, 0.3)' 
                : 'none'
            }}
          >
            {(isSubmitting || loading) ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid currentColor',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Autentificē...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Pieslēgties Admin Panelī
              </>
            )}
          </motion.button>
        </form>

        {/* Help Text */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 8px 0'
          }}>
            Nepieciešamas administratora tiesības
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: '0'
          }}>
            Lietojiet tos pašus piekļuves datus, kurus izmantojat galvenajā vietnē. Ja jums nav administratora tiesību, sazinieties ar sistēmas administratoru.
          </p>
        </div>
      </motion.div>

      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  )
}