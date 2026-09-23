'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, Target, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function WeakSpotsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data } = useQuery({
    queryKey: ['kit', id],
    queryFn: () => fetchWithAuth(`/kits/${id}`),
  });

  const kit = data?.kit;
  if (!kit) return null;

  return (
    <div className="space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-champagne/10 flex items-center justify-center border border-champagne/30">
          <Activity className="w-8 h-8 text-champagne" />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-navy">Weak Spots Analysis</h2>
          <p className="text-charcoal/60 font-medium">Areas to focus on before your interview.</p>
        </div>
      </div>

      {!kit.resume_evaluation ? (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-champagne/30 p-16 text-center shadow-lg shadow-navy/5">
          <Target className="w-16 h-16 text-champagne mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-serif font-bold text-navy mb-4">No Resume Uploaded</h3>
          <p className="text-charcoal/60 mb-8 max-w-md mx-auto">
            Upload your resume on the Overview page to generate a personalized Weak Spots analysis comparing your experience against the job requirements.
          </p>
          <Link href={`/kits/${id}`} className="px-8 py-3 bg-navy text-white font-bold rounded-xl shadow-lg shadow-navy/20 hover:bg-navy-light transition-all">
            Go to Overview
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          
          <div className="bg-white rounded-[2rem] border border-champagne/20 shadow-xl shadow-navy/5 p-10">
            <h3 className="text-2xl font-serif font-bold text-navy flex items-center gap-3 mb-8 pb-4 border-b border-champagne/10">
              <XCircle className="w-6 h-6 text-red-500" />
              Identified Skill Gaps
            </h3>
            
            {kit.resume_evaluation.weaknesses && kit.resume_evaluation.weaknesses.length > 0 ? (
              <ul className="space-y-6">
                {kit.resume_evaluation.weaknesses.map((weak: string, i: number) => (
                  <motion.li 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    key={i} className="flex gap-6 p-6 rounded-2xl bg-red-50/50 border border-red-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-charcoal mb-2">Gap {i + 1}</h4>
                      <p className="text-charcoal/70 leading-relaxed">{weak}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-green-800 font-bold text-lg">Great news! We didn't identify any major weak spots in your profile compared to this role.</p>
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}
