import React, { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Home, 
  Heart, 
  User, 
  Settings, 
  BookOpen, 
  ShoppingCart,
  Keyboard,
  X
} from 'lucide-react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  addShortcut: (shortcut: KeyboardShortcut) => void;
  removeShortcut: (key: string) => void;
  showHelp: boolean;
  toggleHelp: () => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

// Format key combination for display
const formatKeyCombo = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.altKey) {
    parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
  }
  if (shortcut.shiftKey) {
    parts.push('⇧');
  }
  
  // Format special keys
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓', 
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Enter': '↵',
    'Escape': 'Esc',
    'Tab': '⇥',
    'Backspace': '⌫',
  };
  
  const displayKey = keyMap[shortcut.key] || shortcut.key.toUpperCase();
  parts.push(displayKey);
  
  return parts.join(' + ');
};

// Check if shortcut matches the pressed keys
const matchesShortcut = (shortcut: KeyboardShortcut, event: KeyboardEvent): boolean => {
  return (
    shortcut.key.toLowerCase() === event.key.toLowerCase() &&
    !!shortcut.ctrlKey === event.ctrlKey &&
    !!shortcut.altKey === event.altKey &&
    !!shortcut.shiftKey === event.shiftKey &&
    !!shortcut.metaKey === event.metaKey
  );
};

// Help modal component
const ShortcutsHelpModal: React.FC<{
  shortcuts: KeyboardShortcut[];
  onClose: () => void;
}> = ({ shortcuts, onClose }) => {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Klaviatūras saīsnes</h2>
              <p className="text-sm text-gray-600">Ātrākai navigācijai un darbam</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                {category}
              </h3>
              
              <div className="space-y-3">
                {categoryShortcuts.map((shortcut, index) => (
                  <motion.div
                    key={`${shortcut.key}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      {shortcut.icon && (
                        <div className="text-gray-500">
                          {shortcut.icon}
                        </div>
                      )}
                      <span className="text-gray-700 font-medium">
                        {shortcut.description}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {formatKeyCombo(shortcut).split(' + ').map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-600 shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < formatKeyCombo(shortcut).split(' + ').length - 1 && (
                            <span className="text-gray-400 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Spiediet <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">?</kbd> lai atvērtu šo palīgu
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Provider component
export const KeyboardShortcutsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  // Default shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'h',
      action: () => navigate('/'),
      description: 'Uz sākumlapu',
      category: 'navigācija',
      icon: <Home className="w-4 h-4" />,
    },
    {
      key: 'r',
      action: () => navigate('/recipes'),
      description: 'Receptes',
      category: 'navigācija',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      key: 'f',
      action: () => navigate('/favorites'),
      description: 'Favorīti',
      category: 'navigācija',
      icon: <Heart className="w-4 h-4" />,
    },
    {
      key: 'p',
      action: () => navigate('/profile'),
      description: 'Profils',
      category: 'navigācija',
      icon: <User className="w-4 h-4" />,
    },
    {
      key: 'c',
      action: () => navigate('/challenges'),
      description: 'Izaicinājumi',
      category: 'navigācija',
      icon: <ShoppingCart className="w-4 h-4" />,
    },

    // Search
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="meklē"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          navigate('/recipes');
        }
      },
      description: 'Fokuss uz meklēšanu',
      category: 'meklēšana',
      icon: <Search className="w-4 h-4" />,
    },
    {
      key: 's',
      ctrlKey: true,
      action: (e) => {
        e?.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="meklē"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Ātri meklēt',
      category: 'meklēšana',
      icon: <Search className="w-4 h-4" />,
    },

    // General
    {
      key: '?',
      action: () => setShowHelp(true),
      description: 'Rādīt klaviatūras saīsnes',
      category: 'palīdzība',
      icon: <Keyboard className="w-4 h-4" />,
    },
    {
      key: 'Escape',
      action: () => {
        setShowHelp(false);
        // Close any open modals
        const closeButtons = document.querySelectorAll('[data-modal-close], .modal button');
        if (closeButtons.length > 0) {
          (closeButtons[0] as HTMLElement).click();
        }
      },
      description: 'Aizvērt modālos/palīgu',
      category: 'palīdzība',
    },

    // Quick actions
    {
      key: 'n',
      ctrlKey: true,
      action: (e) => {
        e?.preventDefault();
        navigate('/submit');
      },
      description: 'Jauna recepte',
      category: 'darbības',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      key: ',',
      ctrlKey: true,
      action: (e) => {
        e?.preventDefault();
        navigate('/preferences');
      },
      description: 'Iestatījumi',
      category: 'darbības',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // Initialize default shortcuts
  useEffect(() => {
    setShortcuts(defaultShortcuts);
  }, []);

  // Keyboard event handler
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const activeElement = document.activeElement;
      const isInputField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.hasAttribute('contenteditable')
      );

      // Allow help shortcut even in input fields
      if (isInputField && event.key !== '?' && event.key !== 'Escape') {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => 
        !shortcut.disabled && matchesShortcut(shortcut, event)
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isEnabled]);

  // Add visual feedback for help shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !showHelp) {
        const timer = setTimeout(() => {
          // Show a brief tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'fixed top-4 right-4 bg-black text-white px-3 py-2 rounded-lg text-sm z-50 animate-pulse';
          tooltip.textContent = 'Spiediet ? lai redzētu saīsnes';
          document.body.appendChild(tooltip);
          
          setTimeout(() => {
            if (document.body.contains(tooltip)) {
              document.body.removeChild(tooltip);
            }
          }, 2000);
        }, 100);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('keyup', handleKeyDown);
    return () => window.removeEventListener('keyup', handleKeyDown);
  }, [showHelp]);

  const addShortcut = (shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev.filter(s => s.key !== shortcut.key), shortcut]);
  };

  const removeShortcut = (key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  };

  const toggleHelp = () => {
    setShowHelp(prev => !prev);
  };

  const contextValue: KeyboardShortcutsContextType = {
    shortcuts,
    addShortcut,
    removeShortcut,
    showHelp,
    toggleHelp,
    isEnabled,
    setEnabled,
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      
      <AnimatePresence>
        {showHelp && (
          <ShortcutsHelpModal
            shortcuts={shortcuts}
            onClose={() => setShowHelp(false)}
          />
        )}
      </AnimatePresence>
    </KeyboardShortcutsContext.Provider>
  );
};

// Hook for individual components to add their own shortcuts
export const useComponentShortcuts = (componentShortcuts: KeyboardShortcut[]) => {
  const { addShortcut, removeShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    componentShortcuts.forEach(addShortcut);
    
    return () => {
      componentShortcuts.forEach(shortcut => removeShortcut(shortcut.key));
    };
  }, [componentShortcuts, addShortcut, removeShortcut]);
};

// Visual indicator component
export const KeyboardShortcutIndicator: React.FC<{
  shortcut: string;
  description: string;
  className?: string;
}> = ({ shortcut, description, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2 text-xs text-gray-500 ${className}`}>
      <span>{description}</span>
      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
        {shortcut}
      </kbd>
    </div>
  );
};

export default useKeyboardShortcuts;