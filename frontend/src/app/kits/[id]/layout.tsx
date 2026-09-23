'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building, Target, HelpCircle, Layers, Calendar, PlayCircle, Activity } from 'lucide-react';

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-cream font-serif text-xl text-charcoal/50 tracking-widest">Loading kit...</div>;
  if (!data?.kit) return <div className="min-h-screen flex items-center justify-center bg-cream font-serif text-xl text-charcoal/50 tracking-widest">Kit not found</div>;

  const kit = data.kit;

  const tabs = [
    { name: 'Overview', href: `/kits/${id}`, icon: Target },
    { name: 'Company Brief', href: `/kits/${id}/company`, icon: Building },
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
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="bg-white/80 backdrop-blur-md border-b border-champagne/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-charcoal/50 hover:text-navy mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-4xl font-serif font-bold text-navy tracking-tight">{kit.source.role || 'Role'}</h1>
                <p className="text-lg font-medium text-champagne mt-2 tracking-wide">{kit.source.company_url}</p>
              </div>
              <div className="text-left md:text-right bg-cream/50 px-6 py-3 rounded-2xl border border-champagne/20">
                <div className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-1">Status</div>
                <div className={`text-lg font-bold font-serif ${kit.generationState === 'completed' ? 'text-green-700' : kit.generationState === 'failed' ? 'text-red-700' : 'text-navy'}`}>
                  {getProgressState()}
                </div>
              </div>
            </div>
          </div>
          
          <nav className="flex space-x-8 overflow-x-auto scrollbar-hide border-t border-champagne/10 pt-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    whitespace-nowrap py-4 px-2 border-b-[3px] font-bold text-sm flex items-center gap-2 transition-all
                    ${isActive 
                      ? 'border-champagne text-navy'
                      : 'border-transparent text-charcoal/50 hover:text-navy hover:border-champagne/30'}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-champagne' : 'text-charcoal/40'}`} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative">
        {/* Decorative elements in the main content area */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-champagne/5 blur-[100px] rounded-full pointer-events-none" />

        {kit.generationState !== 'completed' && kit.generationState !== 'failed' && (
          <div className="bg-white border border-champagne/30 rounded-3xl p-10 text-center mb-10 shadow-2xl shadow-navy/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-champagne/5 to-transparent pointer-events-none" />
            <div className="animate-spin w-12 h-12 border-[4px] border-champagne/20 border-t-champagne rounded-full mx-auto mb-6"></div>
            <h3 className="text-2xl font-serif font-bold text-navy">Building your premium kit</h3>
            <p className="text-charcoal/70 mt-2 font-medium tracking-wide">This takes a few moments. We are <span className="text-champagne font-bold">{getProgressState().toLowerCase()}</span></p>
          </div>
        )}
        
        {kit.generationState === 'failed' && (
          <div className="bg-white border border-red-200 rounded-3xl p-8 mb-10 text-red-900 shadow-2xl shadow-red-900/5">
            <h3 className="font-serif text-2xl font-bold mb-2">Generation Failed</h3>
            <p className="font-medium text-red-800/80">{kit.error || 'An unknown error occurred.'}</p>
          </div>
        )}

        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
