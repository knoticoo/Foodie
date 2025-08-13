import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type AuthContextValue = {
  token: string | null;
  isAdmin: boolean;
  isPremium: boolean;
  userName: string | null;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  refreshStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchMe = async (jwt: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${jwt}` } });
      if (!res.ok) throw new Error('me failed');
      const me = await res.json();
      setIsAdmin(Boolean(me?.is_admin));
      const premiumActive = Boolean(me?.is_premium) || (me?.premium_expires_at && new Date(me.premium_expires_at) > new Date());
      setIsPremium(premiumActive);
      setUserName(me?.name || me?.full_name || null);
      setUserEmail(me?.email || null);
    } catch {
      setIsAdmin(false);
      setIsPremium(false);
      setUserName(null);
      setUserEmail(null);
    }
  };

  const refreshStatus = async () => {
    if (!token) return;
    await fetchMe(token);
  };

  useEffect(() => {
    if (token) {
      refreshStatus();
    } else {
      setIsAdmin(false);
      setIsPremium(false);
      setUserName(null);
      setUserEmail(null);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Nezināma kļūda' }));
      throw new Error(errorData.error || 'Neizdevās ieiet sistēmā');
    }
    
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
  };

  const register = async (email: string, password: string, name?: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Nezināma kļūda' }));
      throw new Error(errorData.error || 'Neizdevās reģistrēties');
    }
    
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAdmin(false);
    setIsPremium(false);
    setUserName(null);
    setUserEmail(null);
  };

  const authorizedFetch = async (input: RequestInfo, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };

  const value = useMemo(() => ({ token, isAdmin, isPremium, userName, userEmail, login, register, logout, authorizedFetch, refreshStatus }), [token, isAdmin, isPremium, userName, userEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};