'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
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

  const { data } = useQuery({
    queryKey: ['kit', id],
    queryFn: () => fetchWithAuth(`/kits/${id}`),
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/kits/${id}/resume`, {
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
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500 opacity-10 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-semibold tracking-wide border border-white/30">
              {kit.role?.seniority || 'Role Overview'}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-indigo-500/30 backdrop-blur-md text-sm font-semibold tracking-wide border border-indigo-400/30">
              {kit.schedule?.days_available} Day Plan
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            {kit.role?.title || 'Unknown Role'}
          </h2>
          <p className="text-xl text-indigo-100 flex items-center gap-2 font-light">
            <Briefcase className="w-5 h-5 opacity-70" />
            {kit.source?.company_url || 'Unknown Company'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, label: "Role Level", value: kit.role?.seniority || 'Unknown' },
          { icon: Calendar, label: "Study Plan", value: `${kit.schedule?.days_available} Days` },
          { icon: FileText, label: "Questions", value: kit.questions?.length || 0 },
          { icon: BarChart2, label: "Flashcards", value: kit.flashcards?.length || 0 }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
              <stat.icon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-sm font-medium text-gray-500 mb-1">{stat.label}</div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Resume Section */}
      {!kit.resume_evaluation ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl border border-dashed border-gray-300 p-8 md:p-12 text-center"
        >
          <div className="max-w-xl mx-auto">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Check Your Compatibility</h3>
            <p className="text-gray-500 mb-8">Upload your resume (PDF or TXT) to see how well you match the extracted job requirements. We'll identify your strengths and missing gaps.</p>
            
            <form onSubmit={handleUpload} className="flex flex-col items-center gap-4">
              <label className="cursor-pointer group">
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="px-6 py-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/50 group-hover:bg-indigo-50 group-hover:border-indigo-300 transition-all flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-indigo-700">
                    {file ? file.name : 'Select Resume File'}
                  </span>
                </div>
              </label>
              
              {file && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-70 disabled:hover:scale-100"
                >
                  {uploading ? 'Analyzing...' : 'Evaluate Match'}
                </button>
              )}
              {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
            </form>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden"
        >
          <div className="p-8 md:p-10 border-b border-gray-100 flex flex-col md:flex-row items-center gap-10">
            {/* Circular Gauge */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={kit.resume_evaluation.score >= 70 ? '#10b981' : kit.resume_evaluation.score >= 40 ? '#f59e0b' : '#ef4444'} 
                  strokeWidth="8"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * kit.resume_evaluation.score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-gray-900">{kit.resume_evaluation.score}%</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Match</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Evaluation Complete</h3>
              <p className="text-gray-600 text-lg leading-relaxed">{kit.resume_evaluation.summary}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-8 md:p-10 bg-green-50/30">
              <h4 className="flex items-center gap-2 text-lg font-bold text-green-800 mb-6">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Key Strengths
              </h4>
              <ul className="space-y-4">
                {kit.resume_evaluation.strengths.map((str: string, i: number) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                    key={i} className="flex gap-3 text-gray-700"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-green-400" />
                    <span>{str}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="p-8 md:p-10 bg-red-50/30">
              <h4 className="flex items-center gap-2 text-lg font-bold text-red-800 mb-6">
                <XCircle className="w-6 h-6 text-red-500" />
                Missing / Weaknesses
              </h4>
              <ul className="space-y-4">
                {kit.resume_evaluation.weaknesses.map((weak: string, i: number) => (
                  <motion.li 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                    key={i} className="flex gap-3 text-gray-700"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-red-400" />
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-lg font-bold text-yellow-800 mb-1">Coverage Gap Detected</h3>
            <p className="text-yellow-700">We generated questions across {kit.coverage.passes} passes, but some specific requirements from the JD couldn't be reliably mapped to questions.</p>
          </div>
        </div>
      )}
    </div>
  );
}
