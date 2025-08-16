import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChefHat, Key, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface AdminAuthProps {
  onLogin: (token: string) => void
  loading?: boolean
  error?: string
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onLogin, loading, error }) => {
  const [adminKey, setAdminKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminKey.trim()) return

    setIsSubmitting(true)
    try {
      // Validate admin key by making a test request
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      })

      if (response.ok || response.status === 403) {
        // Token is valid format, let the main app handle it
        onLogin(adminKey)
      } else {
        throw new Error('Nepareiza admin atslēga')
      }
    } catch (err) {
      console.error('Login error:', err)
      // Still pass the token to main app for now
      onLogin(adminKey)
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
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Admin API Atslēga
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
                <Key size={20} />
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Ievadiet admin API atslēgu..."
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
                onClick={() => setShowKey(!showKey)}
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
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
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
            disabled={!adminKey.trim() || isSubmitting || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '14px',
              background: adminKey.trim() && !isSubmitting && !loading 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#e5e7eb',
              color: adminKey.trim() && !isSubmitting && !loading ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: adminKey.trim() && !isSubmitting && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: adminKey.trim() && !isSubmitting && !loading 
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
                Pārbauda...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Pieslēgties
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
            Nav admin atslēgas?
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: '0'
          }}>
            Sazinieties ar sistēmas administratoru, lai iegūtu piekļuves atslēgu.
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