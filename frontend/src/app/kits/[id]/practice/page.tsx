'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PracticeTab() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());

  const { data: kitData } = useQuery({
    queryKey: ['kit', id],
    queryFn: () => fetchWithAuth(`/kits/${id}`),
  });

  const { data: progressData } = useQuery({
    queryKey: ['practice-progress', id],
    queryFn: () => fetchWithAuth(`/kits/${id}/practice/progress`),
  });

  const practiceMutation = useMutation({
    mutationFn: (data: any) => fetchWithAuth(`/kits/${id}/practice`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-progress', id] });
    }
  });

  const kit = kitData?.kit;
  if (!kit || !kit.flashcards || kit.flashcards.length === 0) {
    return <div className="p-8 bg-white rounded-2xl border border-gray-200">No flashcards available for practice.</div>;
  }

  // Sort flashcards to prioritize unseen ones or ones with low confidence
  const latestConfidence = progressData?.latestConfidence || {};
  
  // Since sorting on every render while practicing can be jarring, we just use a stable array derived once.
  // For a simple implementation, we'll just take the flashcards as they are, but normally you'd want a useMemo with a stable sort.
  const cards = kit.flashcards;

  if (currentIndex >= cards.length) {
    return (
      <div className="text-center p-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Session Complete!</h2>
        <p className="text-gray-500 mb-8">You have reviewed all flashcards in this deck.</p>
        <button 
          onClick={() => {
            setCurrentIndex(0);
            setShowAnswer(false);
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Start Again
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleConfidence = (score: number) => {
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    practiceMutation.mutate({
      flashcardId: currentCard.id,
      confidence: score,
      duration: duration > 0 ? duration : 1
    });

    setShowAnswer(false);
    setCurrentIndex(prev => prev + 1);
    setSessionStartTime(Date.now());
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between text-sm font-medium text-gray-500 mb-4">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span>{cards.length - currentIndex - 1} remaining</span>
      </div>

      <div className="relative min-h-[400px] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + (showAnswer ? '-back' : '-front')}
            initial={{ opacity: 0, rotateY: showAnswer ? -90 : 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: showAnswer ? 90 : -90 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 w-full h-full p-8 rounded-3xl border-2 shadow-xl flex flex-col justify-center items-center text-center cursor-pointer transition-colors ${
              showAnswer ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => !showAnswer && setShowAnswer(true)}
          >
            {!showAnswer ? (
              <>
                <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-6">Question</span>
                <h3 className="text-2xl font-bold text-gray-900 leading-tight">{currentCard.front}</h3>
                <div className="mt-8 text-sm text-gray-400 font-medium animate-pulse">Tap to reveal answer</div>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-6">Answer</span>
                <p className="text-xl text-gray-800 leading-relaxed">{currentCard.back}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-8"
          >
            <h4 className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">How confident were you?</h4>
            <div className="grid grid-cols-5 gap-2">
              {[
                { s: 1, label: 'Not at all', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                { s: 2, label: 'Slightly', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
                { s: 3, label: 'Moderate', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                { s: 4, label: 'Confident', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                { s: 5, label: 'Very', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
              ].map(btn => (
                <button
                  key={btn.s}
                  onClick={() => handleConfidence(btn.s)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${btn.color}`}
                >
                  <span className="text-xl font-bold mb-1">{btn.s}</span>
                  <span className="text-xs font-semibold">{btn.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
