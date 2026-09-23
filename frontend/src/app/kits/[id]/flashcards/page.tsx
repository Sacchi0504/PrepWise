'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layers, RefreshCw } from 'lucide-react';

export default function FlashcardsPage() {
  const params = useParams();
  const id = params.id as string;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const { data } = useQuery({
    queryKey: ['kit', id],
    queryFn: () => fetchWithAuth(`/kits/${id}`),
  });

  const flashcards = data?.kit?.flashcards || [];

  if (!data?.kit) return null;

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-champagne/10 rounded-full flex items-center justify-center mb-6">
          <Layers className="w-10 h-10 text-champagne" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-navy mb-2">No Flashcards Available</h3>
        <p className="text-charcoal/60">Flashcards have not been generated for this kit yet.</p>
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between w-full mb-8 px-4">
        <h2 className="text-3xl font-serif font-bold text-navy flex items-center gap-3">
          <Layers className="w-8 h-8 text-champagne" />
          Study Flashcards
        </h2>
        <div className="text-sm font-bold tracking-widest text-charcoal/50 uppercase">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
      </div>

      <div 
        className="relative w-full aspect-[3/2] max-w-3xl cursor-pointer group" 
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateX: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 w-full h-full bg-white rounded-[2rem] border-2 border-champagne/20 shadow-xl shadow-navy/10 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group-hover:border-champagne/40 transition-colors"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-champagne/5 blur-[50px] rounded-full" />
            <span className="absolute top-6 left-8 text-xs font-bold text-champagne tracking-widest uppercase">Question</span>
            <p className="text-2xl md:text-3xl font-serif font-bold text-navy leading-relaxed">
              {currentCard.front}
            </p>
            <div className="absolute bottom-6 flex items-center gap-2 text-charcoal/40 text-sm font-medium">
              <RefreshCw className="w-4 h-4" />
              Click to flip
            </div>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 w-full h-full bg-navy text-white rounded-[2rem] border border-navy-light shadow-2xl shadow-navy/20 flex flex-col items-center justify-center p-12 text-center overflow-y-auto"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-champagne/10 blur-[80px] rounded-full" />
            <span className="absolute top-6 left-8 text-xs font-bold text-champagne tracking-widest uppercase">Answer</span>
            <p className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed max-h-full">
              {currentCard.back}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-8 mt-12">
        <button
          onClick={handlePrev}
          className="w-14 h-14 rounded-full bg-white border border-champagne/30 text-navy flex items-center justify-center hover:bg-cream hover:border-champagne transition-all shadow-md group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-8 py-4 rounded-xl bg-champagne text-white font-bold tracking-wide hover:bg-champagne-light shadow-lg shadow-champagne/20 transition-all uppercase text-sm"
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        <button
          onClick={handleNext}
          className="w-14 h-14 rounded-full bg-white border border-champagne/30 text-navy flex items-center justify-center hover:bg-cream hover:border-champagne transition-all shadow-md group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
