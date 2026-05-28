import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaBook, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import GlassPage from '../components/GlassPage';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to send password reset email
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Password reset requested for:', email);
      toast.success('Password reset instructions sent to your email!');
      setEmailSent(true);
    } catch (error) {
      toast.error('Failed to send reset instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <GlassPage>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-md w-full space-y-6 glass-card-premium p-8 md:p-10 rounded-2xl shadow-xl text-white border border-white/10 text-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                <FaEnvelope className="text-green-400 text-2xl" />
              </div>
            </div>
            
            <h2 className="mt-4 text-3xl font-extrabold text-white font-display">
              Check Your Email
            </h2>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              We've sent password reset instructions to <strong className="text-white">{email}</strong>. 
              Please check your inbox and follow the link to reset your password.
            </p>
            
            <p className="text-xs text-slate-400">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setEmailSent(false)}
                className="text-violet-300 hover:text-violet-200 font-semibold transition cursor-pointer"
              >
                try again
              </button>
            </p>
            
            <div className="pt-2">
              <Link 
                to="/login"
                className="inline-flex items-center text-violet-300 hover:text-violet-200 font-medium text-sm transition"
              >
                <FaArrowLeft className="mr-2" />
                Back to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </GlassPage>
    );
  }

  return (
    <GlassPage>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full space-y-6 glass-card-premium p-8 md:p-10 rounded-2xl shadow-xl text-white border border-white/10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <div className="flex justify-center">
              <FaBook className="text-violet-500 text-5xl" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-display">
              Reset Your Password
            </h2>
            <p className="mt-2 text-center text-xs text-slate-300">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-200 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm transition duration-300 disabled:opacity-50 hover:scale-[1.02] shadow-lg shadow-violet-950/20 cursor-pointer"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </div>
            
            <div className="text-center pt-2">
              <Link 
                to="/login"
                className="inline-flex items-center text-violet-300 hover:text-violet-200 font-medium text-sm transition"
              >
                <FaArrowLeft className="mr-2" />
                Back to Login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </GlassPage>
  );
}