import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Crown,
  Star,
  TrendingDown,
  ShoppingCart,
  ExternalLink,
  CheckCircle,
  Lock,
  Zap,
  Heart,
  Gift,
  Target,
  AlertCircle,
  Calculator,
  Wallet
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const premiumFeatures = [
  {
    icon: <Calculator className="w-5 h-5" />,
    title: "Cenu salīdzināšana",
    description: "Salīdziniet produktu cenas dažādos veikalos"
  },
  {
    icon: <TrendingDown className="w-5 h-5" />,
    title: "Izmaksu aprēķins",
    description: "Automatisks receptu izmaksu aprēķins"
  },
  {
    icon: <Crown className="w-5 h-5" />,
    title: "Premium receptes",
    description: "Piekļuve ekskluzīvām receptēm"
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Personalizēti ieteikumi",
    description: "AI vadīti receptu ieteikumi"
  }
];

export const PricesPage: React.FC = () => {
  const { token, isPremium, authorizedFetch } = useAuth();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('g');
  const [cheapest, setCheapest] = useState<any | null>(null);
  const [compare, setCompare] = useState<any[] | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState<string>('');
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetResults, setBudgetResults] = useState<any[] | null>(null);

  const doCheapest = async () => {
    setLoading(true);
    setStatus('');
    setCheapest(null);
    setCompare(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/prices/cheapest?name=${encodeURIComponent(name)}&unit=${encodeURIComponent(unit)}`);
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        setCheapest(data);
      } else {
        setStatus(data.error || 'Kļūda meklējot cenas');
      }
    } catch (error) {
      setStatus('Neizdevās meklēt cenas');
    } finally {
      setLoading(false);
    }
  };

  const doCompare = async () => {
    if (!token && true /* keep button gated visually */) {
      setStatus('Nepieciešams Premium abonements');
      return;
    }

    setLoading(true);
    setStatus('');
    setCompare(null);

    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/prices/compare?name=${encodeURIComponent(name)}&unit=${encodeURIComponent(unit)}`);
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        setCompare(Array.isArray(data?.options) ? data.options : []);
      } else {
        setStatus(data.error || 'Kļūda salīdzinot cenas');
      }
    } catch (error) {
      setStatus('Neizdevās salīdzināt cenas');
    } finally {
      setLoading(false);
    }
  };

  const searchBudgetRecipes = async () => {
    const value = Number(String(budget).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(value) || value <= 0) {
      setStatus('Ievadiet derīgu budžetu (piem., 10)');
      return;
    }
    setBudgetLoading(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/budget?budget=${encodeURIComponent(String(value))}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setBudgetResults(Array.isArray(data?.recipes) ? data.recipes : []);
      } else {
        setBudgetResults([]);
        setStatus(data.error || 'Kļūda meklējot receptes pēc budžeta');
      }
    } catch {
      setBudgetResults([]);
      setStatus('Neizdevās meklēt receptes pēc budžeta');
    } finally {
      setBudgetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl mb-4">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient-primary">Produktu</span>{' '}
              <span className="text-gradient-accent">Cenas</span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Atrodiet labākās cenas produktiem un ietaupiet naudu iepirkšanās laikā
            </p>
          </motion.div>

          {/* Search Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card variant="glass" className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Meklēt produktu cenas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Ievadiet produkta nosaukumu..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      icon={<Search className="w-5 h-5" />}
                      className="text-lg"
                      onKeyDown={(e) => e.key === 'Enter' && doCheapest()}
                    />
                  </div>
                  <div className="w-32">
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="pcs">gab</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={doCheapest}
                    loading={loading}
                    variant="gradient"
                    icon={<TrendingDown className="w-4 h-4" />}
                    disabled={!name.trim()}
                  >
                    Atrast lētāko
                  </Button>
                  
                  {token && isPremium ? (
                    <Button
                      onClick={doCompare}
                      loading={loading}
                      variant="outline"
                      icon={<Calculator className="w-4 h-4" />}
                      disabled={!name.trim()}
                    >
                      Salīdzināt cenas
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      icon={<Lock className="w-4 h-4" />}
                      disabled
                    >
                      Salīdzināt cenas (Premium)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Message */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <Card className="p-4 border-l-4 border-amber-400 bg-amber-50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-700">{status}</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Results Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cheapest Result */}
              {cheapest && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 border-green-200 bg-green-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">Lētākā opcija</h3>
                        <p className="text-sm text-green-600">Labākā cena tirgū</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-neutral-900">{cheapest.productName}</h4>
                      <p className="text-sm text-neutral-600 mb-2">{cheapest.storeName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          €{cheapest.price || 'N/A'} / {cheapest.unit}
                        </span>
                        {cheapest.url && (
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Skatīt
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Comparison Results */}
              {compare && compare.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Cenu salīdzinājums ({compare.length} opcijas)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      {compare.map((option, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-900">{option.productName}</h4>
                            <p className="text-sm text-neutral-600">{option.storeName}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg">
                              €{option.price || 'N/A'}
                            </span>
                            {option.affiliateUrl && (
                              <Button
                                as="a"
                                href={option.affiliateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="sm"
                                variant="gradient"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Pirkt
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {compare && compare.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-8 text-center">
                    <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2">Nav atrasti rezultāti</h3>
                    <p className="text-neutral-500">Mēģiniet citu produkta nosaukumu vai kategoriju</p>
                  </Card>
                </motion.div>
              )}

              {/* Budget Recipes */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Receptes pēc budžeta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Budžets (piem., 10)"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="text-lg"
                          onKeyDown={(e) => e.key === 'Enter' && searchBudgetRecipes()}
                        />
                      </div>
                      <div>
                        <Button
                          onClick={searchBudgetRecipes}
                          loading={budgetLoading}
                          variant="gradient"
                          icon={<Wallet className="w-4 h-4" />}
                          disabled={!String(budget).trim()}
                        >
                          Meklēt receptes
                        </Button>
                      </div>
                    </div>

                    {budgetResults && (
                      <div className="space-y-3 mt-2">
                        {budgetResults.length === 0 ? (
                          <div className="text-sm text-neutral-600">Nav atrastas receptes dotajam budžetam</div>
                        ) : (
                          budgetResults.map((r, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:shadow-sm">
                              <div className="flex items-center gap-3 min-w-0">
                                {r.cover_image ? (
                                  <img src={r.cover_image} alt="cover" className="w-14 h-14 rounded object-cover" />
                                ) : (
                                  <div className="w-14 h-14 rounded bg-neutral-100" />
                                )}
                                <div className="min-w-0">
                                  <a href={`/recipes/${r.id}`} className="font-medium text-neutral-900 hover:underline truncate block">
                                    {r.title}
                                  </a>
                                  <div className="text-sm text-neutral-600">Aptuvenā cena: €{((r.estimatedCostCents || 0) / 100).toFixed(2)}</div>
                                </div>
                              </div>
                              <Button as="a" href={`/recipes/${r.id}`} variant="outline" size="sm">
                                Apskatīt
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Premium Features Sidebar */}
            <div className="space-y-6">
              {!token && (
                <motion.div variants={itemVariants}>
                  <Card className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
                    <div className="text-center mb-4">
                      <Crown className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-primary-800">Piesakieties sistēmā</h3>
                    </div>
                    <p className="text-sm text-primary-700 mb-6 text-center">
                      Izveidojiet kontu, lai piekļūtu Premium funkcijām un saglabātu meklējumus
                    </p>
                    <div className="space-y-3">
                      <Button variant="gradient" fullWidth as="a" href="/register">
                        Reģistrēties
                      </Button>
                      <Button variant="outline" fullWidth as="a" href="/login">
                        Ieiet sistēmā
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {token && !isPremium && (
                <motion.div variants={itemVariants}>
                  <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <div className="text-center mb-4">
                      <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-amber-800">Jaunināt uz Premium</h3>
                    </div>
                    <p className="text-sm text-amber-700 mb-6 text-center">
                      Iegūstiet pilnu piekļuvi visām cenu salīdzināšanas funkcijām
                    </p>
                    <div className="space-y-4 mb-6">
                      {premiumFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                            {feature.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-amber-800">{feature.title}</h4>
                            <p className="text-xs text-amber-600">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="gradient" fullWidth as="a" href="/billing">
                      <Zap className="w-4 h-4 mr-2" />
                      Iegūt Premium
                    </Button>
                  </Card>
                </motion.div>
              )}

              {token && isPremium && (
                <motion.div variants={itemVariants}>
                  <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-800">Premium Aktīvs</h3>
                    </div>
                    <p className="text-sm text-green-700 mb-4 text-center">
                      Jums ir piekļuve visām Premium funkcijām!
                    </p>
                    <div className="space-y-3">
                      {premiumFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-green-700">{feature.title}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Quick Tips */}
              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Gift className="w-5 h-5" />
                      Padomi ietaupīšanai
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-start gap-3">
                      <Heart className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600">
                        Salīdziniet cenas pirms lielajiem iepirkumiem
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600">
                        Izmantojiet sezonālos piedāvājumus
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600">
                        Pērciet lielākos iepakojumos ekonomijai
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};