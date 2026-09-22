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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-8 py-8 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              Generate Prep Kit
            </h1>
            <p className="text-indigo-100">
              Provide the job details and we'll craft a personalized study plan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Job Description
                </label>
                
                <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="font-medium">{jdFile ? jdFile.name : 'Upload JD (PDF/TXT)'}</span>
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
                <div className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 p-6 flex flex-col items-center justify-center text-indigo-800 space-y-2">
                  <FileText className="w-8 h-8 text-indigo-400" />
                  <p className="font-medium">File attached: {jdFile.name}</p>
                  <p className="text-sm text-indigo-600/70">The text will be automatically extracted during generation.</p>
                  <button 
                    type="button"
                    onClick={() => setJdFile(null)}
                    className="text-xs text-red-500 hover:text-red-700 font-bold mt-2"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <textarea
                  required
                  rows={10}
                  className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm"
                  placeholder="Paste the full job description here..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Building className="w-4 h-4 text-indigo-500" />
                  Company Website
                </label>
                <input
                  type="url"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="https://company.com"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Days Available
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  value={daysAvailable}
                  onChange={(e) => setDaysAvailable(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
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
                    <Sparkles className="w-5 h-5" />
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
