'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, XCircle, FileText, Briefcase, Calendar, BarChart2 } from 'lucide-react';

export default function KitOverview() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const { data } = useQuery({
    queryKey: ['kit', id],
    queryFn: () => fetchWithAuth(`/kits/${id}`),
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/kits/${id}/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kit', id] });
      setUploading(false);
      setFile(null);
      setShowUpload(false);
    },
    onError: (err: any) => {
      setUploadError(err.message);
      setUploading(false);
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('resume', file);
    uploadMutation.mutate(formData);
  };

  const kit = data?.kit;
  if (!kit) return null;

  return (
    <div className="space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-navy text-white p-12 shadow-2xl shadow-navy/10 border border-navy-light">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-champagne/10 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-champagne/5 blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col justify-center min-h-[160px]">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="px-5 py-2 rounded-xl bg-white/10 backdrop-blur-md text-sm font-bold tracking-widest uppercase text-champagne border border-white/10">
              {kit.role?.seniority || 'Role Overview'}
            </span>
            <span className="px-5 py-2 rounded-xl bg-champagne/20 backdrop-blur-md text-sm font-bold tracking-widest uppercase text-white border border-champagne/30">
              {kit.schedule?.days_available} Day Plan
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 leading-tight">
            {kit.role?.title || 'Unknown Role'}
          </h2>
          <p className="text-xl text-white/80 flex items-center gap-3 font-medium">
            <Briefcase className="w-6 h-6 text-champagne opacity-90" />
            {kit.source?.company_url || 'Unknown Company'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: Briefcase, label: "Role Level", value: kit.role?.seniority || 'Unknown' },
          { icon: Calendar, label: "Study Plan", value: `${kit.schedule?.days_available} Days` },
          { icon: FileText, label: "Questions", value: kit.questions?.length || 0 },
          { icon: BarChart2, label: "Flashcards", value: kit.flashcards?.length || 0 }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            key={i} 
            className="bg-white p-8 rounded-3xl border border-champagne/20 shadow-xl shadow-navy/5 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center mb-4 border border-champagne/10 shadow-inner">
              <stat.icon className="w-8 h-8 text-champagne" />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2">{stat.label}</div>
            <div className="text-3xl font-serif font-bold text-navy">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Resume Section */}
      {!kit.resume_evaluation || showUpload ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-[2rem] border-2 border-dashed border-champagne/30 p-10 md:p-16 text-center shadow-lg shadow-navy/5 relative overflow-hidden group hover:border-champagne/50 transition-colors"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-champagne/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="max-w-xl mx-auto relative z-10">
            <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-champagne/10">
              <Upload className="w-10 h-10 text-champagne" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-navy mb-4">Check Your Compatibility</h3>
            <p className="text-charcoal/60 mb-10 text-lg">Upload your resume (PDF or TXT) to see how well you match the extracted job requirements. We'll identify your strengths and missing gaps.</p>
            
            <form onSubmit={handleUpload} className="flex flex-col items-center gap-6">
              <label className="cursor-pointer group/upload w-full max-w-sm">
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="px-8 py-5 rounded-2xl border-2 border-champagne/20 bg-cream/50 group-hover/upload:bg-cream group-hover/upload:border-champagne/50 transition-all flex items-center justify-center gap-4">
                  <FileText className="w-6 h-6 text-navy" />
                  <span className="font-bold text-navy text-lg">
                    {file ? file.name : 'Select Resume File'}
                  </span>
                </div>
              </label>
              
              {file && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full max-w-sm px-8 py-4 bg-navy text-white font-bold rounded-xl shadow-xl shadow-navy/20 hover:bg-navy-light transition-all disabled:opacity-70 text-lg"
                >
                  {uploading ? 'Analyzing...' : 'Evaluate Match'}
                </button>
              )}
              {uploadError && <p className="text-red-500 text-sm font-medium">{uploadError}</p>}
              {kit.resume_evaluation && (
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="mt-2 text-charcoal/50 hover:text-navy underline underline-offset-4 font-medium transition-colors"
                >
                  Cancel and go back to results
                </button>
              )}
            </form>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] border border-champagne/20 shadow-2xl shadow-navy/5 overflow-hidden"
        >
          <div className="p-10 md:p-14 border-b border-champagne/10 flex flex-col md:flex-row items-center gap-12 bg-cream/30">
            {/* Circular Gauge */}
            <div className="relative w-56 h-56 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-md" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#FAF9F6" strokeWidth="6" />
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={kit.resume_evaluation.score >= 70 ? '#10b981' : kit.resume_evaluation.score >= 40 ? '#C5A059' : '#ef4444'} 
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * kit.resume_evaluation.score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-serif font-bold text-navy">{kit.resume_evaluation.score}%</span>
                <span className="text-xs font-bold text-charcoal/40 uppercase tracking-widest mt-2">Match</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-serif font-bold text-navy mb-4">Evaluation Complete</h3>
              <p className="text-charcoal/70 text-lg leading-relaxed mb-6">{kit.resume_evaluation.summary}</p>
              <button 
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-champagne text-white font-bold rounded-xl shadow-lg shadow-champagne/20 hover:bg-champagne-light transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload New Resume
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-champagne/10">
            <div className="p-10 md:p-12 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] rounded-full" />
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-navy mb-8">
                <CheckCircle className="w-7 h-7 text-green-500" />
                Key Strengths
              </h4>
              <ul className="space-y-5">
                {kit.resume_evaluation.strengths.map((str: string, i: number) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                    key={i} className="flex gap-4 text-charcoal/80 text-lg leading-relaxed"
                  >
                    <span className="mt-2.5 w-2 h-2 flex-shrink-0 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                    <span>{str}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="p-10 md:p-12 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] rounded-full" />
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-navy mb-8">
                <XCircle className="w-7 h-7 text-red-500" />
                Missing / Weaknesses
              </h4>
              <ul className="space-y-5">
                {kit.resume_evaluation.weaknesses.map((weak: string, i: number) => (
                  <motion.li 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                    key={i} className="flex gap-4 text-charcoal/80 text-lg leading-relaxed"
                  >
                    <span className="mt-2.5 w-2 h-2 flex-shrink-0 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
                    <span>{weak}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Coverage Gap Warning */}
      {kit.coverage && kit.coverage.uncovered_requirement_ids.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 flex items-start gap-6 shadow-sm">
          <div className="text-3xl bg-orange-100 w-12 h-12 flex items-center justify-center rounded-xl">⚠️</div>
          <div>
            <h3 className="text-xl font-serif font-bold text-orange-900 mb-2">Coverage Gap Detected</h3>
            <p className="text-orange-800 text-lg">We generated questions across {kit.coverage.passes} passes, but some specific requirements from the JD couldn't be reliably mapped to questions.</p>
          </div>
        </div>
      )}
    </div>
  );
}
