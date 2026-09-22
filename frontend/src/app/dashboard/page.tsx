'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Calendar, BookOpen, Brain, Clock, ChevronRight, LogOut } from 'lucide-react';

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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading your kits...</div>;
  }

  const kits = data?.kits || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">AI Interview Prep</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button onClick={logout} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Your Interview Kits</h2>
          <Link 
            href="/kits/new" 
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Kit
          </Link>
        </div>

        {kits.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No kits yet</h3>
            <p className="text-gray-500 mb-6">Create your first personalized interview prep kit based on a job description.</p>
            <Link 
              href="/kits/new" 
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Create your first Kit
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kits.map((kit: any, i: number) => {
              const totalQ = kit.questions?.length || 0;
              const totalF = kit.flashcards?.length || 0;
              const progress = kit.generationState === 'completed' ? 100 : 0; // naive progress

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={kit._id}
                >
                  <Link href={`/kits/${kit._id}`} className="block h-full">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all h-full flex flex-col group relative overflow-hidden">
                      {kit.generationState !== 'completed' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '50%' }}></div>
                        </div>
                      )}

                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-1">
                          {kit.source?.role || 'Untitled Role'}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">{kit.source?.company_url || 'Unknown Company'}</p>
                      </div>

                      <div className="flex-1 space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{kit.schedule?.days_available} Days Prep</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span>{totalQ} Questions</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Brain className="w-4 h-4 text-gray-400" />
                          <span>{totalF} Flashcards</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                          {kit.generationState === 'completed' ? 'Continue' : 'Generating...'}
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
