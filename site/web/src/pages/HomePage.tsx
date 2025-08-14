import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChefHat, 
  Clock, 
  Heart, 
  Star, 
  Users, 
  Search,
  TrendingUp,
  Award,
  Globe,
  Sparkles,
  ArrowRight,
  Play,
  BookOpen,
  Camera
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { cn } from '../lib/utils'

// Animation variants
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

const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState({ total_recipes: 0, total_users: 0, total_chefs: 0, total_favorites: 0, average_rating: 0 });

  useEffect(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl transform -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Latvijas #1 Receptu Platforma
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-8"
            >
              <span className="text-gradient-primary">Virtuves</span>
              <br />
              <span className="text-gradient-accent">Māksla</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-neutral-600 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              Atklāj vairāk nekā <span className="font-bold text-primary-600">10,000+ tradicionālu</span> un 
              mūsdienīgu receptu, plāno maltītes un dalies ar saviem kulinārajiem radījumiem
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button 
                size="xl" 
                variant="gradient"
                icon={<Search className="w-5 h-5" />}
                className="group"
                asChild
              >
                <Link to="/recipes">
                  Pārlūkot Receptes
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                size="xl" 
                variant="outline"
                icon={<Play className="w-5 h-5" />}
                className="group"
              >
                Skatīt Demo
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
              </Button>
            </motion.div>

                          {/* Hero Stats */}
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
              >
                {[
                  { icon: BookOpen, value: stats.total_recipes.toLocaleString(), label: 'Receptes' },
                  { icon: Users, value: stats.total_users.toLocaleString(), label: 'Lietotāji' },
                  { icon: ChefHat, value: stats.total_chefs.toLocaleString(), label: 'Pavāri' },
                  { icon: Star, value: `${stats.average_rating.toFixed(1)}★`, label: 'Vērtējums' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                    <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                    <div className="text-sm text-neutral-600">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
</motion.div>
        </div>

        {/* Floating Recipe Cards */}
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="absolute top-32 left-8 hidden lg:block"
        >
          <Card variant="glass" className="w-64 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500" />
              <div>
                <h4 className="font-semibold">Borščs</h4>
                <p className="text-sm text-neutral-600">Tradicionālā biešu biezzupa</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={floatVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
          className="absolute top-64 right-8 hidden lg:block"
        >
          <Card variant="glass" className="w-64 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500" />
              <div>
                <h4 className="font-semibold">Rupjmaizes Kārtojums</h4>
                <p className="text-sm text-neutral-600">Latviskais desertu karalis</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Kāpēc izvēlēties <span className="text-gradient-primary">mūs</span>?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Mūsu platforma apvieno tradīcijas ar modernajām tehnoloģijām
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ChefHat,
                title: 'Ekspertu Receptes',
                description: 'Profesionālu pavāru un mājas kulināru pārbaudītas receptes',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: Clock,
                title: 'Ātra Meklēšana',
                description: 'Atrodiet perfektu recepti dažu sekunžu laikā',
                color: 'from-blue-500 to-purple-500'
              },
              {
                icon: Globe,
                title: 'Latviskā Kultūra',
                description: 'Saglabājam un popularizējam latviešu kulināro mantojumu',
                color: 'from-green-500 to-teal-500'
              },
              {
                icon: Heart,
                title: 'Personalizēti',
                description: 'AI algoritmi, kas iesaka receptes pēc jūsu gaumēm',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: Camera,
                title: 'Vizuāli Skaists',
                description: 'Augstas kvalitātes foto un video materiāli',
                color: 'from-purple-500 to-indigo-500'
              },
              {
                icon: TrendingUp,
                title: 'Iknedēļas Jaunumi',
                description: 'Regulāri papildinām ar jaunām receptēm un idejām',
                color: 'from-emerald-500 to-cyan-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card variant="bordered" hoverable className="h-full p-8 group">
                  <CardContent className="p-0 text-center">
                    <div className={cn(
                      'w-16 h-16 rounded-2xl bg-gradient-to-br mx-auto mb-6',
                      'flex items-center justify-center transform group-hover:scale-110 transition-transform',
                      feature.color
                    )}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Sāciet savu kulināro ceļojumu šodien
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Pievienojieties tūkstošiem apmierinātu lietotāju un atklājiet jaunu garšu pasauli
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="secondary" asChild>
                <Link to="/register">Reģistrēties Bezmaksas</Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600" asChild>
                <Link to="/recipes">Apskatīt Receptes</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}