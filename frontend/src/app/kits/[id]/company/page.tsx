'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Globe, FileText, Link as LinkIcon } from 'lucide-react';

export default function CompanyBrief() {
  const params = useParams();
  const id = params.id as string;

  const { data } = useQuery({
    queryKey: ['kit', id],
    queryFn: () => fetchWithAuth(`/kits/${id}`),
  });

  const kit = data?.kit;
  if (!kit || !kit.company_brief) return null;

  return (
    <div className="space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-navy text-white p-10 md:p-14 shadow-2xl shadow-navy/10 border border-navy-light">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-champagne/10 blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col justify-center">
          <div className="w-16 h-16 rounded-2xl bg-champagne/20 backdrop-blur-md flex items-center justify-center mb-6 border border-champagne/30">
            <Building2 className="w-8 h-8 text-champagne" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Company Brief
          </h2>
          <p className="text-lg text-white/80 flex items-center gap-2 font-medium max-w-2xl">
            <Globe className="w-5 h-5 text-champagne opacity-90" />
            Extracted insights based on the company's public presence.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[2rem] border border-champagne/20 shadow-xl shadow-navy/5 p-8 md:p-12"
          >
            <h3 className="text-2xl font-serif font-bold text-navy flex items-center gap-3 mb-6 border-b border-champagne/10 pb-4">
              <FileText className="w-6 h-6 text-champagne" />
              What They Do
            </h3>
            <div className="prose prose-lg prose-slate text-charcoal/80">
              <p className="leading-relaxed whitespace-pre-wrap">
                {kit.company_brief.what_they_do || 'Information about what this company does is not available yet.'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-[2rem] border border-champagne/20 shadow-xl shadow-navy/5 p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-champagne/5 blur-[50px] rounded-full" />
            <h3 className="text-2xl font-serif font-bold text-navy flex items-center gap-3 mb-6 border-b border-champagne/10 pb-4">
              <Building2 className="w-6 h-6 text-champagne" />
              Company Summary
            </h3>
            <div className="prose prose-lg prose-slate text-charcoal/80 relative z-10">
              <p className="leading-relaxed whitespace-pre-wrap">
                {kit.company_brief.summary || 'Summary is not available yet.'}
              </p>
            </div>
          </motion.div>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-cream rounded-3xl border border-champagne/20 p-8 shadow-inner"
          >
            <h4 className="text-lg font-serif font-bold text-navy mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-champagne" />
              Sources Used
            </h4>
            
            {kit.company_brief.sources && kit.company_brief.sources.length > 0 ? (
              <ul className="space-y-4">
                {kit.company_brief.sources.map((source: string, idx: number) => (
                  <li key={idx}>
                    <a 
                      href={source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex flex-col p-4 bg-white rounded-2xl border border-champagne/20 hover:border-champagne/50 hover:shadow-md transition-all"
                    >
                      <span className="text-sm font-bold text-navy group-hover:text-champagne transition-colors truncate">
                        {new URL(source).hostname.replace('www.', '')}
                      </span>
                      <span className="text-xs text-charcoal/50 truncate mt-1">
                        {new URL(source).pathname !== '/' ? new URL(source).pathname : source}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-charcoal/60 bg-white/50 p-4 rounded-xl border border-champagne/10">
                No specific sources were referenced or the crawler hasn't finished.
              </div>
            )}
          </motion.div>
        </div>
        
      </div>
    </div>
  );
}
