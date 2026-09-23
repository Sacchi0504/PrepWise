'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { fetchWithAuth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-champagne/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-navy/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-navy/5 border border-champagne/20 relative z-10"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center shadow-lg shadow-navy/20 mb-6">
            <Brain className="w-8 h-8 text-champagne" />
          </div>
          <h2 className="text-center text-4xl font-serif font-bold text-navy tracking-tight">
            Create Account
          </h2>
          <p className="mt-3 text-center text-sm text-charcoal/70">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-champagne hover:text-champagne-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-100 py-3 rounded-xl">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="block w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne focus:border-transparent transition-all shadow-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="block w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne focus:border-transparent transition-all shadow-sm"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-navy hover:bg-navy-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy transition-all shadow-lg shadow-navy/20 disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
