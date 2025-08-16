import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  MessageCircle,
  Mail,
  Link,
  Download,
  Printer,
  Copy,
  QrCode,
  Heart,
  X
} from 'lucide-react';
import QRCode from 'qrcode';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  cookTime?: number;
  servings?: number;
  rating?: number;
  ingredients?: string[];
  instructions?: string[];
  author?: string;
}

interface SocialShareProps {
  recipe: Recipe;
  url?: string;
  className?: string;
  variant?: 'button' | 'dropdown' | 'modal';
  showLabel?: boolean;
}

const generateRecipeText = (recipe: Recipe): string => {
  const parts = [
    `🍽️ ${recipe.title}`,
    recipe.description ? `📝 ${recipe.description}` : '',
    recipe.cookTime ? `⏱️ Gatavošanas laiks: ${recipe.cookTime} min` : '',
    recipe.servings ? `👥 Porcijas: ${recipe.servings}` : '',
    recipe.rating ? `⭐ Vērtējums: ${recipe.rating}/5` : '',
    '\n#VirtuvesMāksla #Receptes #Kulinārija'
  ];
  
  return parts.filter(Boolean).join('\n');
};

const SocialPlatform: React.FC<{
  platform: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  label: string;
}> = ({ platform, icon, color, onClick, label }) => (
  <motion.button
    onClick={onClick}
    className={`
      flex items-center gap-3 w-full px-4 py-3 rounded-lg
      transition-all duration-200 hover:scale-105
      text-white font-medium
      ${color}
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="w-5 h-5 flex-shrink-0">
      {icon}
    </div>
    <span className="flex-1 text-left">{label}</span>
  </motion.button>
);

export const SocialShare: React.FC<SocialShareProps> = ({
  recipe,
  url: customUrl,
  className = '',
  variant = 'button',
  showLabel = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const currentUrl = customUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const shareUrl = `https://virtuves-maksla.lv/recipes/${recipe.id}`;
  const recipeText = generateRecipeText(recipe);

  // Generate QR code for recipe URL
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [isOpen, shareUrl]);

  // Share Analytics
  const trackShare = (platform: string) => {
    setShareCount(prev => prev + 1);
    
    // Track with analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        event_category: 'engagement',
        event_label: platform,
        content_type: 'recipe',
        item_id: recipe.id
      });
    }
  };

  // Platform share functions
  const sharePlatforms = {
    facebook: () => {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(recipeText)}`;
      window.open(url, 'facebook-share', 'width=580,height=400');
      trackShare('facebook');
    },
    
    twitter: () => {
      const tweetText = `${recipe.title}\n\n${recipe.description || ''}\n\n${shareUrl}\n\n#VirtuvesMāksla #Receptes`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(url, 'twitter-share', 'width=580,height=400');
      trackShare('twitter');
    },
    
    whatsapp: () => {
      const message = `${recipeText}\n\n${shareUrl}`;
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, 'whatsapp-share');
      trackShare('whatsapp');
    },
    
    telegram: () => {
      const message = `${recipeText}\n\n${shareUrl}`;
      const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
      window.open(url, 'telegram-share');
      trackShare('telegram');
    },
    
    email: () => {
      const subject = `Recepte: ${recipe.title}`;
      const body = `${recipeText}\n\nApskatiet pilnu recepti šeit: ${shareUrl}`;
      const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = url;
      trackShare('email');
    },
    
    copyLink: async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
        trackShare('copy_link');
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
        trackShare('copy_link');
      }
    },

    downloadRecipe: () => {
      const recipeData = {
        title: recipe.title,
        description: recipe.description,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        url: shareUrl,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(recipeData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recipe.title.toLowerCase().replace(/\s+/g, '-')}.recipe.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      trackShare('download');
    },

    printRecipe: () => {
      window.print();
      trackShare('print');
    }
  };

  // Native Web Share API support
  const canUseNativeShare = typeof navigator !== 'undefined' && navigator.share;

  const nativeShare = async () => {
    if (!canUseNativeShare) return;
    
    try {
      await navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: shareUrl
      });
      trackShare('native');
    } catch (error) {
      console.log('Native sharing cancelled or failed');
    }
  };

  const ShareButton = () => (
    <motion.button
      onClick={() => canUseNativeShare ? nativeShare() : setIsOpen(true)}
      className={`
        flex items-center gap-2 px-4 py-2 
        bg-blue-600 hover:bg-blue-700 text-white 
        rounded-lg transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Share2 className="w-4 h-4" />
      {showLabel && <span>Dalīties</span>}
    </motion.button>
  );

  const ShareDropdown = () => (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 
          text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
          rounded-lg transition-colors duration-200
          ${className}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Share2 className="w-4 h-4" />
        {showLabel && <span>Dalīties</span>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            <ShareContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const ShareModal = () => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Dalīties ar recepti
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <ShareContent />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ShareContent = () => (
    <div className="space-y-4">
      {/* Recipe Preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {recipe.title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {recipe.description}
          </p>
        </div>
      </div>

      {/* Social Platforms */}
      <div className="grid grid-cols-2 gap-3">
        <SocialPlatform
          platform="facebook"
          icon={<Facebook className="w-5 h-5" />}
          color="bg-blue-600 hover:bg-blue-700"
          onClick={sharePlatforms.facebook}
          label="Facebook"
        />
        
        <SocialPlatform
          platform="twitter"
          icon={<Twitter className="w-5 h-5" />}
          color="bg-sky-500 hover:bg-sky-600"
          onClick={sharePlatforms.twitter}
          label="Twitter"
        />
        
        <SocialPlatform
          platform="whatsapp"
          icon={<MessageCircle className="w-5 h-5" />}
          color="bg-green-600 hover:bg-green-700"
          onClick={sharePlatforms.whatsapp}
          label="WhatsApp"
        />
        
        <SocialPlatform
          platform="email"
          icon={<Mail className="w-5 h-5" />}
          color="bg-gray-600 hover:bg-gray-700"
          onClick={sharePlatforms.email}
          label="E-pasts"
        />
      </div>

      {/* Additional Actions */}
      <div className="grid grid-cols-1 gap-2">
        <motion.button
          onClick={sharePlatforms.copyLink}
          className={`
            flex items-center gap-3 w-full px-4 py-3 rounded-lg
            transition-all duration-200
            ${copiedToClipboard 
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Copy className="w-5 h-5" />
          <span>{copiedToClipboard ? 'Saite nokopēta!' : 'Kopēt saiti'}</span>
        </motion.button>
        
        <motion.button
          onClick={sharePlatforms.downloadRecipe}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-5 h-5" />
          <span>Lejupielādēt recepti</span>
        </motion.button>
        
        <motion.button
          onClick={sharePlatforms.printRecipe}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Printer className="w-5 h-5" />
          <span>Drukāt recepti</span>
        </motion.button>
      </div>

      {/* QR Code */}
      {qrCodeDataUrl && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Skenējiet QR kodu, lai atvērtu recepti
          </p>
          <div className="inline-block p-4 bg-white rounded-lg">
            <img src={qrCodeDataUrl} alt="QR kods receptei" className="w-32 h-32" />
          </div>
        </div>
      )}

      {/* Share Count */}
      {shareCount > 0 && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <Heart className="w-4 h-4 inline text-red-500 mr-1" />
            Dalīts {shareCount} {shareCount === 1 ? 'reizi' : 'reizes'}
          </p>
        </div>
      )}
    </div>
  );

  // Click outside handler for dropdown
  useEffect(() => {
    if (variant === 'dropdown' && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, variant]);

  // Render based on variant
  switch (variant) {
    case 'dropdown':
      return <ShareDropdown />;
    case 'modal':
      return (
        <>
          <ShareButton />
          <ShareModal />
        </>
      );
    default:
      return <ShareButton />;
  }
};

// Compact share buttons for recipe cards
export const QuickShareButtons: React.FC<{
  recipe: Recipe;
  className?: string;
}> = ({ recipe, className = '' }) => {
  const shareUrl = `https://virtuves-maksla.lv/recipes/${recipe.id}`;
  
  const quickShares = [
    {
      icon: <Facebook className="w-4 h-4" />,
      onClick: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, 'facebook-share', 'width=580,height=400');
      },
      color: 'hover:bg-blue-100 hover:text-blue-600'
    },
    {
      icon: <Twitter className="w-4 h-4" />,
      onClick: () => {
        const text = `${recipe.title} - ${shareUrl}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, 'twitter-share', 'width=580,height=400');
      },
      color: 'hover:bg-sky-100 hover:text-sky-600'
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      onClick: () => {
        const message = `${recipe.title}\n${shareUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, 'whatsapp-share');
      },
      color: 'hover:bg-green-100 hover:text-green-600'
    }
  ];

  return (
    <div className={`flex gap-1 ${className}`}>
      {quickShares.map((share, index) => (
        <motion.button
          key={index}
          onClick={share.onClick}
          className={`
            p-2 rounded-lg text-gray-500 dark:text-gray-400
            transition-colors duration-200 ${share.color}
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {share.icon}
        </motion.button>
      ))}
    </div>
  );
};

export default SocialShare;