import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaBook, FaEye, FaEyeSlash, FaArrowLeft, FaCheck } from 'react-icons/fa';
import GlassPage from '../components/GlassPage';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call to reset password
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Password reset with token:', token);
      toast.success('Password reset successfully!');
      setSuccess(true);
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
                <FaCheck className="text-green-400 text-2xl" />
              </div>
            </div>
            
            <h2 className="mt-4 text-3xl font-extrabold text-white font-display">
              Password Reset
            </h2>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <div className="pt-4">
              <Link 
                to="/login"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold text-sm transition duration-300 cursor-pointer"
              >
                Continue to Login
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
              Enter your new password below.
            </p>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-200 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength="6"
                className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none pr-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-7 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-200 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength="6"
                className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none pr-10"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-7 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm transition duration-300 disabled:opacity-50 hover:scale-[1.02] shadow-lg shadow-violet-950/20 cursor-pointer"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
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