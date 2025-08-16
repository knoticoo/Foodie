import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Camera, 
  Heart, 
  ChefHat, 
  Star, 
  Calendar, 
  Trophy, 
  Settings, 
  Upload, 
  Edit3,
  Save,
  X,
  Crown,
  Shield,
  Award,
  BookOpen,
  Utensils,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

interface UserStats {
  totalRecipes: number;
  totalFavorites: number;
  avgRating: number;
  totalRatings: number;
  joinDate: string;
  chefLevel: string;
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  rating?: number;
  created_at: string;
  is_premium?: boolean;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  is_admin: boolean;
  is_premium: boolean;
  premium_expires_at?: string;
  chef_level?: number;
  total_recipes?: number;
  created_at: string;
}

export const ProfilePage: React.FC = () => {
  const { token, userName, userEmail, isAdmin, isPremium, authorizedFetch } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [submittedRecipes, setSubmittedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'submitted' | 'settings'>('overview');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    location: '',
    phone: '',
    website: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  const API_BASE_URL = typeof window !== 'undefined'
    ? `http://${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

  useEffect(() => {
    if (!token) return;
    loadUserData();
  }, [token]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const profileRes = await authorizedFetch(`${API_BASE_URL}/api/auth/me`);
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserProfile(profile);
        setEditData({
          name: profile.name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          phone: profile.phone || '',
          website: profile.website || ''
        });
      }
      
      // Load user stats
      const statsRes = await authorizedFetch(`${API_BASE_URL}/api/user/stats`);
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setUserStats(stats);
      }
      
      // Load saved recipes
      const savedRes = await authorizedFetch(`${API_BASE_URL}/api/user/favorites`);
      if (savedRes.ok) {
        const saved = await savedRes.json();
        setSavedRecipes(saved.recipes || []);
      }
      
      // Load submitted recipes
      const submittedRes = await authorizedFetch(`${API_BASE_URL}/api/user/recipes`);
      if (submittedRes.ok) {
        const submitted = await submittedRes.json();
        setSubmittedRecipes(submitted.recipes || []);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfilePicturePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) return;
    
    const formData = new FormData();
    formData.append('profilePicture', profilePicture);
    
    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/user/profile-picture`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const result = await res.json();
        setUserProfile(prev => prev ? { ...prev, profile_picture_url: result.url } : null);
        setProfilePicture(null);
        setProfilePicturePreview(null);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      if (res.ok) {
        const updated = await res.json();
        setUserProfile(prev => ({ ...prev, ...updated }));
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pieslēgšanās nepieciešama</h2>
          <p className="text-gray-600 mb-6">Lūdzu, piesakieties savā kontā, lai skatītu profilu.</p>
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Pieslēgties
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ielādē profilu...</p>
        </div>
      </div>
    );
  }

  const getChefBadge = () => {
    const recipeCount = userProfile?.total_recipes || submittedRecipes.length;
    if (recipeCount >= 50) return { icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Master Chef' };
    if (recipeCount >= 20) return { icon: Award, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Expert Chef' };
    if (recipeCount >= 10) return { icon: ChefHat, color: 'text-green-600', bg: 'bg-green-100', label: 'Chef' };
    if (recipeCount >= 5) return { icon: Utensils, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Cook' };
    return { icon: User, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Beginner' };
  };

  const chefBadge = getChefBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8"
        >
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <div className="relative px-8 pb-8">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center overflow-hidden">
                    {userProfile?.profile_picture_url || profilePicturePreview ? (
                      <img 
                        src={profilePicturePreview || userProfile?.profile_picture_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Camera button */}
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userProfile?.name || userName || 'Lietotājs'}
                  </h1>
                  
                  {/* Badges */}
                  <div className="flex gap-2">
                    {isAdmin && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        Admin
                      </div>
                    )}
                    
                    {isPremium && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        <Crown className="w-4 h-4" />
                        Premium
                      </div>
                    )}
                    
                    <div className={`flex items-center gap-1 px-3 py-1 ${chefBadge.bg} ${chefBadge.color} rounded-full text-sm font-medium`}>
                      <chefBadge.icon className="w-4 h-4" />
                      {chefBadge.label}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-2">{userProfile?.email || userEmail}</p>
                
                {userProfile?.bio && (
                  <p className="text-gray-700 mb-4">{userProfile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {userProfile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {userProfile.location}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Pievienojās {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('lv-LV', { year: 'numeric', month: 'long' }) : 'nesen'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {profilePicturePreview && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={uploadProfilePicture}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Saglabāt bildi
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  {editMode ? 'Atcelt' : 'Rediģēt'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: ChefHat, label: 'Receptes', value: submittedRecipes.length, color: 'blue' },
            { icon: Heart, label: 'Saglabātās', value: savedRecipes.length, color: 'red' },
            { icon: Star, label: 'Vid. vērtējums', value: userStats?.avgRating?.toFixed(1) || '0.0', color: 'yellow' },
            { icon: Trophy, label: 'Līmenis', value: chefBadge.label, color: 'purple' }
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-6 shadow-lg text-center"
            >
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-100 flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Edit Mode */}
        <AnimatePresence>
          {editMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Rediģēt profilu</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vārds</label>
                  <input 
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Atrašanās vieta</label>
                  <input 
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rīga, Latvija"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea 
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Pastāstiet par sevi un savām kulinārajām interesēm..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tālrunis</label>
                  <input 
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+371 12345678"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mājaslapa</label>
                  <input 
                    type="url"
                    value={editData.website}
                    onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6 pt-6 border-t">
                <button
                  onClick={saveProfile}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Saglabāt izmaiņas
                </button>
                
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Atcelt
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Pārskats', icon: User },
                { id: 'saved', label: `Saglabātās (${savedRecipes.length})`, icon: Heart },
                { id: 'submitted', label: `Manas receptes (${submittedRecipes.length})`, icon: ChefHat },
                { id: 'settings', label: 'Iestatījumi', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitātes kopsavilkums</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-600">
                      {userProfile?.name || 'Lietotājs'} ir pievienojies {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('lv-LV') : 'nesen'} un ir 
                      dalījies ar {submittedRecipes.length} receptēm, kā arī saglabājis {savedRecipes.length} iecienītas receptes.
                    </p>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Jaunākās aktivitātes</h3>
                  <div className="space-y-3">
                    {[...submittedRecipes, ...savedRecipes.map(r => ({...r, type: 'saved'}))]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            {(item as any).type === 'saved' ? 
                              <Heart className="w-4 h-4 text-red-500" /> : 
                              <ChefHat className="w-4 h-4 text-blue-500" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {(item as any).type === 'saved' ? 'Saglabāja' : 'Pievienoja'} recepti "{item.title}"
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.created_at).toLocaleDateString('lv-LV')}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Saglabātās receptes</h3>
                {savedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedRecipes.map((recipe) => (
                      <motion.div
                        key={recipe.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {recipe.image_url && (
                          <img 
                            src={recipe.image_url} 
                            alt={recipe.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{recipe.title}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                          {recipe.rating && (
                            <div className="flex items-center gap-1 mb-3">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{recipe.rating.toFixed(1)}</span>
                            </div>
                          )}
                          <Link 
                            to={`/recipes/${recipe.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Skatīt recepti →
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Nav saglabātu recepšu</h4>
                    <p className="text-gray-600 mb-6">Sāciet pārlūkot receptes un saglabājiet savās iecienītākās!</p>
                    <Link 
                      to="/recipes"
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Pārlūkot receptes
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submitted' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Manas receptes</h3>
                  <Link 
                    to="/submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <ChefHat className="w-4 h-4" />
                    Pievienot recepti
                  </Link>
                </div>
                
                {submittedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submittedRecipes.map((recipe) => (
                      <motion.div
                        key={recipe.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {recipe.image_url && (
                          <img 
                            src={recipe.image_url} 
                            alt={recipe.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{recipe.title}</h4>
                            {recipe.is_premium && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                          <div className="flex items-center justify-between">
                            {recipe.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">{recipe.rating.toFixed(1)}</span>
                              </div>
                            )}
                            <Link 
                              to={`/recipes/${recipe.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Skatīt →
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Nav pievienotu recepšu</h4>
                    <p className="text-gray-600 mb-6">Dalieties ar savām iecienītākajām receptēm ar kopienu!</p>
                    <Link 
                      to="/submit"
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Pievienot pirmo recepti
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Konta iestatījumi</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">E-pasta adrese</h4>
                        <p className="text-sm text-gray-600">{userProfile?.email}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Mainīt
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Parole</h4>
                        <p className="text-sm text-gray-600">••••••••</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Mainīt
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Premium statuss</h4>
                        <p className="text-sm text-gray-600">
                          {isPremium ? 'Aktīvs' : 'Nav aktīvs'}
                        </p>
                      </div>
                      <Link 
                        to="/billing"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Pārvaldīt
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <Link 
                      to="/preferences"
                      className="flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">Kulinārijas preferences</h4>
                        <p className="text-sm text-gray-600">Diētas ierobežojumi un budžets</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Konfigurēt →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};