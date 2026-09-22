'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Building, Target, HelpCircle, 
  Layers, Calendar, PlayCircle, Activity 
} from 'lucide-react';

export default function KitLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['kit', id],
    queryFn: () => fetchWithAuth(`/kits/${id}`),
    refetchInterval: (data: any) => 
      data?.kit?.generationState && data.kit.generationState !== 'completed' && data.kit.generationState !== 'failed' ? 3000 : false
  });

  if (isLoading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-medium text-indigo-300 tracking-wider">INITIALIZING...</p>
    </div>
  );
  
  if (!data?.kit) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      Kit not found
    </div>
  );

  const kit = data.kit;

  const tabs = [
    { name: 'Overview', href: `/kits/${id}`, icon: Target },
    { name: 'Company', href: `/kits/${id}/company`, icon: Building },
    { name: 'Questions', href: `/kits/${id}/questions`, icon: HelpCircle },
    { name: 'Flashcards', href: `/kits/${id}/flashcards`, icon: Layers },
    { name: 'Plan', href: `/kits/${id}/schedule`, icon: Calendar },
    { name: 'Practice', href: `/kits/${id}/practice`, icon: PlayCircle },
    { name: 'Weak Spots', href: `/kits/${id}/weak-spots`, icon: Activity },
  ];

  const getProgressState = () => {
    switch (kit.generationState) {
      case 'queued': return 'In Queue...';
      case 'researching': return 'Researching Company...';
      case 'generating': return 'Extracting Requirements...';
      case 'validating': return 'Generating Questions & Validating...';
      case 'completed': return 'Ready';
      case 'failed': return 'Generation Failed';
      default: return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Top minimal back button */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide">Exit Session</span>
        </Link>
      </div>

      <main className="h-screen overflow-y-auto pb-32 pt-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto relative z-10 scrollbar-hide">
        {kit.generationState !== 'completed' && kit.generationState !== 'failed' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-950/50 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-6 text-center mb-10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-indigo-100 tracking-wide">SYNTHESIZING DATA</h3>
            <p className="text-indigo-300 mt-2 font-mono text-sm">{getProgressState().toUpperCase()}</p>
          </motion.div>
        )}
        
        {kit.generationState === 'failed' && (
          <div className="bg-red-950/50 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 mb-10 text-red-200">
            <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Activity /> System Failure</h3>
            <p className="font-mono text-sm opacity-80">{kit.error || 'An unknown anomaly occurred during generation.'}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Glass Dock Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <nav className="flex items-center gap-2 p-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            
            return (
              <Link key={tab.name} href={tab.href} className="relative group">
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/50 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={`
                  relative px-4 py-3 rounded-full flex flex-col items-center gap-1 transition-all duration-300
                  ${isActive ? 'text-indigo-300 scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}`} />
                  {isActive && (
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      {tab.name}
                    </span>
                  )}
                  {/* Tooltip for inactive tabs */}
                  {!isActive && (
                    <div className="absolute -top-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 bg-slate-800 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded border border-white/10 shadow-xl whitespace-nowrap pointer-events-none">
                      {tab.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
