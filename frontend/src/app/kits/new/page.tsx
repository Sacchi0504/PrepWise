'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Building, Clock, FileText, Upload } from 'lucide-react';
import Link from 'next/link';

export default function CreateKit() {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [daysAvailable, setDaysAvailable] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };

      let body: BodyInit;

      if (jdFile) {
        const formData = new FormData();
        formData.append('jdFile', jdFile);
        formData.append('companyUrl', companyUrl);
        formData.append('daysAvailable', daysAvailable.toString());
        body = formData;
      } else {
        if (!jd) throw new Error("Please either paste a Job Description or upload a document.");
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ jd, companyUrl, daysAvailable });
      }

      const res = await fetch(`${API_URL}/kits`, {
        method: 'POST',
        headers,
        body
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create kit');

      // Redirect to the detail page which will poll for status
      router.push(`/kits/${data.kit._id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-charcoal/50 hover:text-navy mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl shadow-navy/5 border border-champagne/20 overflow-hidden"
        >
          <div className="px-10 py-12 bg-navy relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-champagne/10 blur-[80px] rounded-full pointer-events-none" />
            
            <h1 className="text-4xl font-serif font-bold text-white mb-3 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-champagne" />
              Generate Prep Kit
            </h1>
            <p className="text-champagne/80 text-lg">
              Provide the job details and we'll craft a personalized study plan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-base font-bold text-navy">
                  <FileText className="w-5 h-5 text-champagne" />
                  Job Description
                </label>
                
                <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-navy bg-cream hover:bg-champagne/10 border border-champagne/20 px-4 py-2 rounded-xl transition-all shadow-sm font-semibold">
                  <Upload className="w-4 h-4" />
                  <span>{jdFile ? jdFile.name : 'Upload JD (PDF/TXT)'}</span>
                  <input 
                    type="file" 
                    accept=".pdf,.txt" 
                    className="hidden" 
                    onChange={(e) => {
                      setJdFile(e.target.files?.[0] || null);
                      if (e.target.files?.[0]) setJd('');
                    }}
                  />
                </label>
              </div>

              {jdFile ? (
                <div className="w-full rounded-2xl border-2 border-dashed border-champagne bg-champagne/5 p-8 flex flex-col items-center justify-center text-navy space-y-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <FileText className="w-6 h-6 text-champagne" />
                  </div>
                  <p className="font-bold text-lg">{jdFile.name}</p>
                  <p className="text-sm text-charcoal/60">The text will be automatically extracted during generation.</p>
                  <button 
                    type="button"
                    onClick={() => setJdFile(null)}
                    className="text-xs text-red-500 hover:text-red-700 font-bold mt-2 uppercase tracking-wider"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <textarea
                  required
                  rows={10}
                  className="w-full rounded-2xl border border-gray-200 p-5 text-base text-charcoal bg-white focus:ring-2 focus:ring-champagne focus:border-transparent outline-none transition-all resize-none shadow-sm placeholder-gray-400"
                  placeholder="Paste the full job description here..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-bold text-navy">
                  <Building className="w-5 h-5 text-champagne" />
                  Company Website
                </label>
                <input
                  type="url"
                  required
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 text-base text-charcoal bg-white focus:ring-2 focus:ring-champagne focus:border-transparent outline-none transition-all shadow-sm placeholder-gray-400"
                  placeholder="https://company.com"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base font-bold text-navy">
                  <Clock className="w-5 h-5 text-champagne" />
                  Days Available
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 text-base text-charcoal bg-white focus:ring-2 focus:ring-champagne focus:border-transparent outline-none transition-all shadow-sm"
                  value={daysAvailable}
                  onChange={(e) => setDaysAvailable(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-3 bg-champagne text-white px-10 py-4 rounded-xl font-bold hover:bg-champagne-light transition-all shadow-xl shadow-champagne/30 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Prep Kit
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
