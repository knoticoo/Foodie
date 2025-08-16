import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  ChefHat, 
  ArrowLeft, 
  BookOpen,
  UtensilsCrossed,
  Coffee,
  Heart
} from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  // Track 404 for analytics (when implemented)
  useEffect(() => {
    // Analytics tracking for 404 pages
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: '404 - Page Not Found',
        page_location: window.location.href,
      });
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

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
  };

  const popularPages = [
    {
      title: 'Receptes',
      description: 'Atklājiet jaunas receptes',
      icon: <BookOpen className="w-5 h-5" />,
      path: '/recipes',
      color: 'bg-blue-500'
    },
    {
      title: 'Favorīti',
      description: 'Jūsu saglabātās receptes',
      icon: <Heart className="w-5 h-5" />,
      path: '/favorites',
      color: 'bg-red-500'
    },
    {
      title: 'Izaicinājumi',
      description: 'Kulinārijas izaicinājumi',
      icon: <UtensilsCrossed className="w-5 h-5" />,
      path: '/challenges',
      color: 'bg-green-500'
    },
    {
      title: 'Cenas',
      description: 'Salīdziniet produktu cenas',
      icon: <Coffee className="w-5 h-5" />,
      path: '/prices',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-4xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Animation */}
        <motion.div
          className="relative mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="text-9xl md:text-[12rem] font-bold text-orange-200 select-none"
            animate={{ 
              scale: [1, 1.02, 1],
              rotate: [0, 1, 0, -1, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            404
          </motion.div>
          
          {/* Floating Chef Hat */}
          <motion.div
            className="absolute top-4 right-1/4 text-orange-400"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <ChefHat size={48} />
          </motion.div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ups! Šī lapa nav atrasta
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Šķiet, ka recepte, ko meklējat, ir pazudusi virtuves dūmos...
          </p>
          <p className="text-gray-500">
            Bet neuztraucieties! Mums ir daudz citu garšīgu receptu, ko piedāvāt.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Atgriezties atpakaļ
          </motion.button>
          
          <Link to="/">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-5 h-5" />
              Uz sākumlapu
            </motion.button>
          </Link>
          
          <Link to="/recipes">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="w-5 h-5" />
              Meklēt receptes
            </motion.button>
          </Link>
        </motion.div>

        {/* Popular Pages Grid */}
        <motion.div
          className="mb-12"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Populāras lapas
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularPages.map((page, index) => (
              <motion.div
                key={page.path}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                custom={index}
              >
                <Link
                  to={page.path}
                  className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 group"
                >
                  <div className={`w-12 h-12 ${page.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    {page.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {page.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {page.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search Box */}
        <motion.div
          className="max-w-md mx-auto"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vai meklējāt kaut ko konkrētu?
          </h3>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Meklēt receptes..."
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-shadow duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  if (query.trim()) {
                    navigate(`/recipes?q=${encodeURIComponent(query.trim())}`);
                  }
                }
              }}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Nospiediet Enter, lai meklētu
          </p>
        </motion.div>

        {/* Fun Facts */}
        <motion.div
          className="mt-16 p-6 bg-white bg-opacity-50 rounded-2xl backdrop-blur-sm border border-white border-opacity-20"
          variants={itemVariants}
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Vai zinājāt?
          </h4>
          <p className="text-gray-600">
            Vidējais cilvēks pavada virtuves 37 minūtes dienā. 
            Izmantojiet šo laiku lietderīgi ar mūsu receptēm!
          </p>
        </motion.div>

        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-orange-200"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            >
              {i % 3 === 0 ? (
                <ChefHat size={24} />
              ) : i % 3 === 1 ? (
                <UtensilsCrossed size={20} />
              ) : (
                <Coffee size={22} />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;