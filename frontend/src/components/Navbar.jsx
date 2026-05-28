import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { getNotifications } from '../services/bookService'
import { 
  FaBook, 
  FaHome, 
  FaQuestionCircle, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHeart,
  FaUpload,
  FaBell,
  FaChartLine,
  FaCog,
  FaUserShield,
  FaTags,
  FaChevronDown
} from 'react-icons/fa'

import { toAssetUrl } from '../services/api'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const fetchNotifications = async () => {
      try {
        const items = await getNotifications()
        setUnreadNotifications(items.filter(n => !n.read).length)
      } catch (err) {
        // fail silently
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 20000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    logoutUser()
    navigate('/')
    setIsOpen(false)
    setShowUserDropdown(false)
  }

  const primaryNavItems = [
    { name: 'Home', path: '/', icon: <FaHome className="mr-2" /> },
    { name: 'Library', path: '/library', icon: <FaBook className="mr-2" /> },
    { name: 'Shelves', path: '/catalog', icon: <FaTags className="mr-2" /> },
    { name: 'Favorites', path: '/favorites', icon: <FaHeart className="mr-2" /> },
    { name: 'Mood Lab', path: '/mood-lab', icon: <FaMagicIcon className="mr-2" /> },
  ]

  // Custom helper because FaMagic is used
  function FaMagicIcon(props) {
    return <span className="mr-2">✨</span>;
  }

  return (
    <motion.nav 
      className="bg-[#0b0c24]/80 backdrop-blur-lg border-b border-white/10 text-white sticky top-0 z-50 shadow-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold flex items-center text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-fuchsia-200 to-indigo-200">
            <FaBook className="mr-2 text-violet-400" />
            BookHub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <div className="flex space-x-5 items-center border-r border-white/10 pr-5">
              {primaryNavItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  className="text-slate-200 hover:text-white transition duration-300 flex items-center text-sm font-medium"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications Bell */}
                <Link 
                  to="/notifications" 
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition duration-300"
                >
                  <FaBell size={18} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* User Dropdown Trigger */}
                <div className="relative">
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                    className="flex items-center space-x-2 text-slate-200 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition duration-300 font-medium text-sm focus:outline-none"
                  >
                    {user.profilePicture ? (
                      <img 
                        src={toAssetUrl(user.profilePicture)} 
                        alt={user.name} 
                        className="h-6 w-6 rounded-full object-cover border border-white/20" 
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{user.name}</span>
                    <FaChevronDown className={`text-xs transition-transform duration-300 ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div 
                        className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0d0f28]/95 backdrop-blur-xl shadow-2xl p-2 z-50 text-white"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-3 py-2 border-b border-white/10 mb-1">
                          <p className="text-xs text-slate-400">Signed in as</p>
                          <p className="text-sm font-semibold truncate">{user.email}</p>
                          <p className="text-[10px] uppercase font-bold text-violet-400 mt-0.5">{user.role}</p>
                        </div>

                        <Link 
                          to="/profile"
                          className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                        >
                          <FaUser className="mr-2 text-slate-400" />
                          My Profile
                        </Link>

                        <Link 
                          to="/settings"
                          className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                        >
                          <FaCog className="mr-2 text-slate-400" />
                          Settings
                        </Link>

                        <Link 
                          to="/support"
                          className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                        >
                          <FaQuestionCircle className="mr-2 text-slate-400" />
                          Support Help
                        </Link>

                        {/* Writer / Admin actions */}
                        {(user.role === 'writer' || user.role === 'admin') && (
                          <>
                            <div className="border-t border-white/10 my-1"></div>
                            <Link 
                              to="/upload"
                              className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                            >
                              <FaUpload className="mr-2 text-violet-400" />
                              Publish Book
                            </Link>
                            <Link 
                              to="/writer-dashboard"
                              className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                            >
                              <FaChartLine className="mr-2 text-violet-400" />
                              Writer Dashboard
                            </Link>
                          </>
                        )}

                        {user.role === 'admin' && (
                          <Link 
                            to="/admin"
                            className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                          >
                            <FaUserShield className="mr-2 text-fuchsia-400" />
                            Admin Console
                          </Link>
                        )}

                        <div className="border-t border-white/10 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-white hover:bg-rose-500/20 transition text-left"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white transition duration-300 text-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition duration-300 text-sm shadow-md shadow-violet-900/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none p-1"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div 
            className="md:hidden pb-6 border-t border-white/10 pt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-3">
              {primaryNavItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  className="hover:text-purple-200 transition duration-300 flex items-center py-2 text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="border-t border-white/10 my-2"></div>
                  
                  <Link 
                    to="/notifications" 
                    className="hover:text-purple-200 transition duration-300 flex items-center py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaBell className="mr-2" />
                    Notifications ({unreadNotifications})
                  </Link>

                  <Link 
                    to="/profile"
                    className="hover:text-purple-200 transition duration-300 flex items-center py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="mr-2" />
                    My Profile
                  </Link>

                  <Link 
                    to="/settings"
                    className="hover:text-purple-200 transition duration-300 flex items-center py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaCog className="mr-2" />
                    Settings
                  </Link>

                  <Link 
                    to="/support"
                    className="hover:text-purple-200 transition duration-300 flex items-center py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaQuestionCircle className="mr-2" />
                    Support Help
                  </Link>

                  {(user.role === 'writer' || user.role === 'admin') && (
                    <>
                      <Link 
                        to="/upload"
                        className="hover:text-purple-200 transition duration-300 flex items-center py-2 text-sm font-medium text-violet-300"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaUpload className="mr-2" />
                        Publish Book
                      </Link>
                      <Link 
                        to="/writer-dashboard"
                        className="hover:text-purple-200 transition duration-300 flex items-center py-2 text-sm font-medium text-violet-300"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaChartLine className="mr-2" />
                        Writer Dashboard
                      </Link>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <Link 
                      to="/admin"
                      className="hover:text-purple-200 transition duration-300 flex items-center py-2 text-sm font-medium text-fuchsia-300"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaUserShield className="mr-2" />
                      Admin Console
                    </Link>
                  )}

                  <div className="border-t border-white/10 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="hover:text-rose-400 transition duration-300 flex items-center py-2 text-sm font-medium text-left"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout ({user.name})
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-white/10 my-2"></div>
                  <Link 
                    to="/login" 
                    className="hover:text-purple-200 transition duration-300 py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition duration-300 text-sm inline-block text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}