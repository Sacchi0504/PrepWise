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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading kit...</div>;
  if (!data?.kit) return <div className="min-h-screen flex items-center justify-center">Kit not found</div>;

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{kit.source.role || 'Role'}</h1>
                <p className="text-lg text-gray-500 mt-1">{kit.source.company_url}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className={`text-lg font-bold ${kit.generationState === 'completed' ? 'text-green-600' : kit.generationState === 'failed' ? 'text-red-600' : 'text-indigo-600'}`}>
                  {getProgressState()}
                </div>
              </div>
            </div>
          </div>
          
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${isActive 
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {kit.generationState !== 'completed' && kit.generationState !== 'failed' && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center mb-8">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-indigo-900">Building your kit</h3>
            <p className="text-indigo-700 mt-1">This takes a few moments. We are {getProgressState().toLowerCase()}</p>
          </div>
        )}
        
        {kit.generationState === 'failed' && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8 text-red-900">
            <h3 className="font-bold">Generation Failed</h3>
            <p className="mt-1">{kit.error || 'An unknown error occurred.'}</p>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
