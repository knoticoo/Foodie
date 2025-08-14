import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChefHat, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  Star,
  Crown,
  BookOpen,
  Users,
  Award
} from 'lucide-react'

const footerLinks = {
  platform: [
    { label: 'Receptes', href: '/recipes' },
    { label: 'Kategorijas', href: '/categories' },
    { label: 'Izaicinājumi', href: '/challenges' },
    { label: 'Plānotājs', href: '/planner' },
    { label: 'Premium', href: '/billing' },
  ],
  community: [
    { label: 'Par mums', href: '/about' },
    { label: 'Blogs', href: '/blog' },
    { label: 'Pavāru profili', href: '/chefs' },
    { label: 'Atbalsts', href: '/support' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Privātuma politika', href: '/privacy' },
    { label: 'Noteikumi', href: '/terms' },
    { label: 'Sīkdatnes', href: '/cookies' },
    { label: 'Kontakti', href: '/contact' },
    { label: 'Karjera', href: '/careers' },
  ]
}

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/virtuves-maksla', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/virtuves.maksla', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/virtuves-maksla', label: 'YouTube' },
  { icon: Twitter, href: 'https://twitter.com/virtualsmaksla', label: 'Twitter' },
]

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const Footer: React.FC = () => {
  const [stats, setStats] = React.useState({ total_recipes: 0, total_users: 0, total_chefs: 0, total_favorites: 0, average_rating: 0 });

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/stats`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setStats({
            total_recipes: Number(data.total_recipes || 0),
            total_users: Number(data.total_users || 0),
            total_chefs: Number(data.total_chefs || 0),
            total_favorites: Number(data.total_favorites || 0),
            average_rating: Number(data.average_rating || 0)
          });
        }
      } catch {}
    })();
    return () => { isMounted = false };
  }, []);

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}
        />
      </div>

      <div className="relative">
        {/* Stats Section */}
        <div className="border-b border-neutral-700">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: BookOpen, value: stats.total_recipes.toLocaleString(), label: 'Receptes' },
                { icon: Users, value: stats.total_users.toLocaleString(), label: 'Lietotāji' },
                { icon: Award, value: stats.total_chefs.toLocaleString(), label: 'Pavāri' },
                { icon: Star, value: stats.average_rating.toFixed(1), label: 'Vērtējums' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl mb-3">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-neutral-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold">Virtuves Māksla</h3>
                  <p className="text-neutral-400 text-sm">Latvijas receptu platforma</p>
                </div>
              </div>
              
              <p className="text-neutral-300 leading-relaxed">
                Mēs apkopojam labākās latviešu tradicionālās un modernās receptes vienā vietā. 
                Atklājiet jaunu garšu pasauli un dalieties ar saviem kulinārajiem radījumiem.
              </p>

              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-neutral-800 hover:bg-gradient-to-br hover:from-primary-500 hover:to-secondary-500 rounded-lg flex items-center justify-center transition-all duration-200 group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-6 text-white">Platforma</h4>
                <ul className="space-y-3">
                  {footerLinks.platform.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.href}
                        className="text-neutral-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-6 text-white">Kopiena</h4>
                <ul className="space-y-3">
                  {footerLinks.community.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.href}
                        className="text-neutral-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 bg-secondary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-6 text-white">Informācija</h4>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.href}
                        className="text-neutral-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 bg-accent-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter & Contact */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Jaunumi</h4>
                <p className="text-neutral-400 text-sm mb-4">
                  Saņemiet jaunākās receptes un kulināros padomus
                </p>
                
                <div className="space-y-3">
                  <div className="flex">
                    <input 
                      type="email" 
                      placeholder="Jūsu e-pasts"
                      className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-l-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-r-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200"
                    >
                      <Mail className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Pierakstoties, jūs piekrītat mūsu privātuma politikai
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">Kontakti</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 text-neutral-400">
                    <Mail className="w-4 h-4 text-primary-500" />
                    <span>info@virtuves-maksla.lv</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-400">
                    <Phone className="w-4 h-4 text-secondary-500" />
                    <span>+371 20 123 456</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-400">
                    <MapPin className="w-4 h-4 text-accent-500" />
                    <span>Rīga, Latvija</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <span>© 2024 Virtuves Māksla. Izveidots ar</span>
                <Heart className="w-4 h-4 text-red-500" />
                <span>Latvijā</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-neutral-400">
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Premium partneri
                </span>
                <span>Versija 2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}