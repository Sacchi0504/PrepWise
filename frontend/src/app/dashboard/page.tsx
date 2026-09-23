'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Calendar, BookOpen, Brain, ChevronRight, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ['kits'],
    queryFn: () => fetchWithAuth('/kits'),
    enabled: !!user,
  });

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-charcoal/50 font-serif text-xl tracking-widest">
        Loading...
      </div>
    );
  }

  const kits = data?.kits || [];

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white/80 backdrop-blur-md border-b border-champagne/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center shadow-md">
              <Brain className="w-5 h-5 text-champagne" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-navy tracking-tight">AI Interview Prep</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-charcoal/70">{user?.email}</span>
            <button 
              onClick={logout} 
              className="text-charcoal/50 hover:text-navy flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-12 border-b border-champagne/20 pb-6">
          <div>
            <h2 className="text-4xl font-serif font-bold text-navy tracking-tight">Your Interview Kits</h2>
            <p className="mt-2 text-charcoal/60">Manage and continue your personalized study plans.</p>
          </div>
          <Link 
            href="/kits/new" 
            className="flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-light transition-all shadow-lg shadow-navy/20 font-bold"
          >
            <Plus className="w-5 h-5" />
            Create Kit
          </Link>
        </div>

        {kits.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-champagne/20 p-16 text-center shadow-2xl shadow-navy/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-champagne/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="w-20 h-20 bg-cream rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-champagne/10">
              <Briefcase className="w-10 h-10 text-champagne" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-navy mb-3">No kits created yet</h3>
            <p className="text-charcoal/60 mb-8 max-w-md mx-auto">Upload a job description and company URL to generate your first tailored interview preparation kit.</p>
            <Link 
              href="/kits/new" 
              className="inline-flex items-center gap-2 bg-champagne text-white px-8 py-4 rounded-xl hover:bg-champagne-light transition-all shadow-lg shadow-champagne/30 font-bold"
            >
              <Plus className="w-5 h-5" />
              Start Preparation
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {kits.map((kit: any, i: number) => {
              const totalQ = kit.questions?.length || 0;
              const totalF = kit.flashcards?.length || 0;
              const progress = kit.generationState === 'completed' ? 100 : 0; // naive progress

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  key={kit._id}
                  className="group h-full"
                >
                  <Link href={`/kits/${kit._id}`} className="block h-full">
                    <div className="bg-white rounded-3xl border border-champagne/20 p-8 hover:shadow-2xl hover:shadow-navy/10 transition-all duration-300 h-full flex flex-col relative overflow-hidden group-hover:-translate-y-1">
                      {kit.generationState !== 'completed' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-cream">
                          <div className="h-full bg-champagne animate-pulse" style={{ width: '50%' }}></div>
                        </div>
                      )}

                      <div className="mb-6">
                        <h3 className="text-2xl font-serif font-bold text-navy line-clamp-1 mb-2">
                          {kit.source?.role || 'Untitled Role'}
                        </h3>
                        <p className="text-sm text-champagne font-semibold tracking-wide uppercase">{new URL(kit.source?.company_url || 'https://unknown.com').hostname.replace('www.', '')}</p>
                      </div>

                      <div className="flex-1 space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-sm text-charcoal/70">
                          <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-navy" />
                          </div>
                          <span className="font-medium">{kit.schedule?.days_available} Days Prep</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-charcoal/70">
                          <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-navy" />
                          </div>
                          <span className="font-medium">{totalQ} Questions</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-charcoal/70">
                          <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center">
                            <Brain className="w-4 h-4 text-navy" />
                          </div>
                          <span className="font-medium">{totalF} Flashcards</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-champagne/10 flex items-center justify-between">
                        <div className="flex-1 mr-6">
                          <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden">
                            <div className="h-full bg-navy rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-bold text-champagne group-hover:text-champagne-light transition-colors">
                          {kit.generationState === 'completed' ? 'View Kit' : 'Generating'}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
