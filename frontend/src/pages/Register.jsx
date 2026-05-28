import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import { FaBook, FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa'
import GlassPage from '../components/GlassPage'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpStage, setOtpStage] = useState(false)
  const [otp, setOtp] = useState("")
  const [devOtp, setDevOtp] = useState("")
  
  const { registerUser, verifyOtpAndLogin, resendSignupOtp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    try {
      setLoading(true)
      const response = await registerUser(formData.name, formData.email, formData.password, formData.role)
      setOtpStage(true)
      setDevOtp(response?.devOtp || "")
      toast.success(response?.devOtp ? `OTP generated (dev bypass): ${response.devOtp}` : "OTP sent to your email")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await verifyOtpAndLogin(formData.email, otp)
      toast.success("Email verified and account activated")
      navigate("/library")
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      setLoading(true)
      const response = await resendSignupOtp(formData.email)
      setDevOtp(response?.devOtp || "")
      toast.success(response?.devOtp ? `New OTP (dev bypass): ${response.devOtp}` : "New OTP sent")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
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
              {otpStage ? "Verification Needed" : "Join BookHub"}
            </h2>
            <p className="mt-2 text-center text-xs text-slate-300">
              {otpStage ? "Enter verification token" : "Start your reading & writing journey today. Or "}
              {!otpStage && (
                <Link to="/login" className="font-semibold text-violet-300 hover:text-violet-200 transition">
                  sign in here
                </Link>
              )}
            </p>
          </div>

          {!otpStage ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-200 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none"
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-xs font-semibold text-slate-200 mb-1">
                  Account Purpose
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none"
                >
                  <option value="user" className="bg-slate-900 text-white">Reader - Read and track books</option>
                  <option value="writer" className="bg-slate-900 text-white">Writer - Write and upload works</option>
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-200 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-200 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-7 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-200 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none pr-10"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-7 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm transition duration-300 disabled:opacity-50 hover:scale-[1.02] shadow-lg shadow-violet-950/20"
              >
                {loading ? 'Initiating account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <p className="text-xs text-slate-300 text-center leading-relaxed">
                A verification passcode has been sent. Check your inbox at <span className="font-semibold text-white">{formData.email}</span>.
              </p>

              {!!devOtp && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-center text-sm text-emerald-300">
                  Dev OTP Bypass: <b className="tracking-widest font-mono text-base ml-1">{devOtp}</b>
                </div>
              )}

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-3xl font-bold tracking-[0.3em] text-white focus:outline-none focus:border-violet-500 focus:bg-white/10 transition"
                placeholder="000000"
                required
              />

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 py-3 text-sm font-semibold text-white transition disabled:opacity-40"
              >
                {loading ? "Verifying..." : "Verify OTP Code"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="w-full rounded-xl border border-white/10 hover:border-white/20 py-2.5 text-xs text-slate-300 transition"
              >
                Resend Code
              </button>

              {/* Informative SMTP Help block */}
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex gap-3 items-start">
                <FaInfoCircle className="text-amber-400 mt-0.5 shrink-0" size={14} />
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white block mb-0.5">Real Mail Configuration</span>
                  To send real OTP emails, verify that your Gmail account has a 16-character App Password (not your primary password) configured as <code className="bg-black/25 px-1 py-0.5 rounded">EMAIL_PASS</code> in <code className="bg-black/25 px-1 py-0.5 rounded">backend/.env</code>.
                </div>
              </div>

            </form>
          )}
        </motion.div>
      </div>
    </GlassPage>
  )
}