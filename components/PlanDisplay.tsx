'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useFitnessStore } from '@/store/fitnessStore';
import { RotateCcw, Download, Volume2, Image as ImageIcon, X, Loader2, Trash, Database, ArrowLeft } from 'lucide-react';
import { generateImage, generateVoice, generatePlan } from '@/lib/api';
import { exportToPDF } from '@/lib/pdfExport';
import { deletePlanFromSupabase, getPlansFromSupabase, savePlanToSupabase, supabase, type SavedPlan } from '@/lib/supabase';

export default function PlanDisplay() {
  const { plan, clearPlan, profile, setLoading, setError, setPlan, setProfile } = useFitnessStore();
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [loadingImage, setLoadingImage] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supabaseEnabled = !!supabase;
  const hasSavedPlans = supabaseEnabled && savedPlans.length > 0;

  if (!plan) return null;

  const handleEditDetails = () => {
    // Keep existing profile to prefill the form, just clear the plan so the form shows again
    setPlan(null);
  };

  const handleRegenerate = async () => {
    const currentProfile = profile;
    if (!currentProfile) {
      setError('No profile found. Please re-enter your details.');
      clearPlan();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await generatePlan(currentProfile);
    } catch (error) {
      console.error('Error regenerating plan:', error);
      setError('Failed to regenerate plan. Please try again.');
      setLoading(false);
    }
  };

  const handleLoadPlan = async (saved: SavedPlan) => {
    setLoadingPlanId(saved.id || null);
    try {
      setProfile(saved.profile);
      setPlan(saved.plan);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleExportPDF = () => {
    if (plan && profile) {
      exportToPDF(plan, profile);
    }
  };

  const handleImageClick = async (item: string, type: 'exercise' | 'meal') => {
    setLoadingImage(item);
    try {
      const imageUrl = await generateImage(`${type === 'exercise' ? 'Fitness exercise: ' : 'Food meal: '}${item}`);
      setSelectedImage({ url: imageUrl, title: item });
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoadingImage(null);
    }
  };

  const stopVoicePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (utteranceRef.current) {
      speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    setPlayingAudio(null);
  };

  const handleVoiceClick = async (section: 'workout' | 'diet') => {
    // If something is playing, stop it and return (acts as Stop button)
    if (playingAudio) {
      stopVoicePlayback();
      return;
    }

    // Stop any lingering audio before starting a new one
    stopVoicePlayback();

    setPlayingAudio(section);
    try {
      let text = '';
      if (section === 'workout') {
        text = plan.workoutPlan.map(day => {
          return `${day.day}: ${day.exercises.map(ex => `${ex.name} - ${ex.sets} sets of ${ex.reps} reps`).join(', ')}`;
        }).join('. ');
      } else {
        text = plan.dietPlan.map(day => {
          return `${day.day}: Breakfast - ${day.meals.breakfast}, Lunch - ${day.meals.lunch}, Dinner - ${day.meals.dinner}, Snacks - ${day.meals.snacks.join(' and ')}`;
        }).join('. ');
      }

      const result = await generateVoice(text, section);
      
      if (result.useBrowserTTS) {
        // Use browser TTS
        const utterance = new SpeechSynthesisUtterance(result.text);
        utteranceRef.current = utterance;
        utterance.onend = () => stopVoicePlayback();
        speechSynthesis.speak(utterance);
      } else if (result.audioUrl) {
        // Play audio from URL
        const audio = new Audio(result.audioUrl);
        audioRef.current = audio;
        audio.onended = () => stopVoicePlayback();
        audio.play();
      }
    } catch (error) {
      console.error('Error generating voice:', error);
      setError('Could not generate voice. Please try again.');
      stopVoicePlayback();
    }
  };

  const fetchSavedPlans = async () => {
    if (!supabaseEnabled) return;
    setLoadingSaved(true);
    try {
      const plans = await getPlansFromSupabase();
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error fetching saved plans:', error);
      setError('Unable to load saved plans right now.');
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleSavePlan = async () => {
    if (!supabaseEnabled) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable saving.');
      return;
    }
    if (!profile || !plan) {
      setError('No plan to save. Please generate a plan first.');
      return;
    }
    setSavingPlan(true);
    setError(null);
    try {
      const id = await savePlanToSupabase(profile, plan);
      if (!id) {
        setError('Failed to save plan. Please try again.');
      } else {
        await fetchSavedPlans();
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      setError('Failed to save plan. Please try again.');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId?: string) => {
    if (!planId || !supabaseEnabled) return;
    try {
      await deletePlanFromSupabase(planId);
      await fetchSavedPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Failed to delete plan.');
    }
  };

  useEffect(() => {
    if (supabaseEnabled) {
      fetchSavedPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseEnabled]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4 justify-end mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEditDetails}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Details
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Regenerate Plan
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSavePlan}
          disabled={savingPlan || !supabaseEnabled}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {savingPlan ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {supabaseEnabled ? 'Save to Supabase' : 'Enable Supabase'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </motion.button>
      </motion.div>

      {/* Saved Plans (Supabase) */}
      {supabaseEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Saved Plans (Supabase)</h3>
            </div>
            <button
              onClick={fetchSavedPlans}
              className="text-sm px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Refresh
            </button>
          </div>
          {loadingSaved ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading saved plans...
            </div>
          ) : !hasSavedPlans ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">No saved plans yet. Click “Save to Supabase” to store this plan.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {savedPlans.map((p) => (
                <div
                  key={p.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-900"
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{p.profile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Goal: {p.profile.goal} • Level: {p.profile.level}
                    </p>
                    {p.created_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Saved: {new Date(p.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadPlan(p)}
                      disabled={loadingPlanId === p.id}
                      className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                    >
                      {loadingPlanId === p.id ? 'Loading...' : 'Load'}
                    </button>
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="p-2 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800/50"
                      aria-label="Delete saved plan"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Motivation Quotes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-4">Daily Motivation</h2>
        <div className="space-y-2">
          {plan.motivation.map((quote, idx) => (
            <p key={idx} className="text-lg">{quote}</p>
          ))}
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Personalized Tips
        </h2>
        <ul className="space-y-3">
          {plan.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Workout Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Workout Plan
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVoiceClick('workout')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              playingAudio === 'workout'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {playingAudio === 'workout' ? 'Stop' : 'Read Plan'}
          </motion.button>
        </div>
        <div className="space-y-6">
          {plan.workoutPlan.map((day, dayIdx) => (
            <motion.div
              key={dayIdx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: dayIdx * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {day.day}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {day.exercises.map((exercise, exIdx) => (
                  <motion.div
                    key={exIdx}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-colors"
                    onClick={() => handleImageClick(exercise.name, 'exercise')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {exercise.name}
                      </h4>
                      {loadingImage === exercise.name ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Sets: {exercise.sets}</p>
                      <p>Reps: {exercise.reps}</p>
                      <p>Rest: {exercise.rest}</p>
                      <p className="text-xs italic mt-2">{exercise.notes}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Diet Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Diet Plan
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVoiceClick('diet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              playingAudio === 'diet'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {playingAudio === 'diet' ? 'Stop' : 'Read Plan'}
          </motion.button>
        </div>
        <div className="space-y-6">
          {plan.dietPlan.map((day, dayIdx) => (
            <motion.div
              key={dayIdx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: dayIdx * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {day.day}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Breakfast', meal: day.meals.breakfast },
                  { label: 'Lunch', meal: day.meals.lunch },
                  { label: 'Dinner', meal: day.meals.dinner },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-colors"
                    onClick={() => handleImageClick(item.meal, 'meal')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {item.label}
                      </h4>
                      {loadingImage === item.meal ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{item.meal}</p>
                  </motion.div>
                ))}
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                    Snacks
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {day.meals.snacks.map((snack, snackIdx) => (
                      <motion.span
                        key={snackIdx}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-colors text-sm text-gray-600 dark:text-gray-400"
                        onClick={() => handleImageClick(snack, 'meal')}
                      >
                        {snack}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedImage.title}
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full rounded-lg"
              onError={(e) => {
                const fallback = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                  setSelectedImage({ ...selectedImage, url: fallback });
                }
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

