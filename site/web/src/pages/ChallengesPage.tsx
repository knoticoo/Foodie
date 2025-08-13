import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Users, Trophy } from 'lucide-react';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Challenge = { id: string; title: string; description?: string; start_date?: string; end_date?: string };

export const ChallengesPage: React.FC = () => {
  const [items, setItems] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/challenges`);
        const data = await response.json();
        setItems(data?.challenges || []);
      } catch (error) {
        console.error('Failed to load challenges:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-gradient-primary">Kulinārijas</span>{' '}
            <span className="text-gradient-accent">Izaicinājumi</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Pievienojieties tematiskajiem gatavošanas izaicinājumiem un pierādiet savas prasmes
          </p>
        </motion.div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-600">Ielādē izaicinājumus...</p>
              </div>
            </div>
          ) : items.length > 0 ? (
            <div className="grid gap-6">
              {items.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">{challenge.title}</h3>
                      {challenge.description && (
                        <p className="text-neutral-600 mb-4">{challenge.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{challenge.start_date} – {challenge.end_date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Aktīvs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">Nav aktīvu izaicinājumu</h3>
              <p className="text-neutral-500 mb-6">Pašlaik nav pieejami izaicinājumi. Sekojiet līdzi jaunumiem!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};