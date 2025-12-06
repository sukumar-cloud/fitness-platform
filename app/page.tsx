'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserForm from '@/components/UserForm';
import PlanDisplay from '@/components/PlanDisplay';
import { useFitnessStore } from '@/store/fitnessStore';
import ThemeToggle from '@/components/ThemeToggle';
import { Dumbbell, X } from 'lucide-react';

export default function Home() {
  const { plan, isLoading, error, setError } = useFitnessStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <ThemeToggle />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Dumbbell className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Fitness Coach
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Get personalized workout and diet plans powered by AI
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-700/60 dark:bg-red-900/30 dark:text-red-100"
          >
            <div className="space-y-1">
              <p className="font-semibold">Something went wrong</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="rounded-md p-2 hover:bg-red-100 dark:hover:bg-red-800/50"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {!plan ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <UserForm />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlanDisplay />
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Generating your personalized plan...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

