import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FaHeart, 
  FaRegHeart, 
  FaDownload, 
  FaBookOpen,
  FaBook,
  FaStar
} from 'react-icons/fa'

export default function BookCard({ book }) {
  const [imageError, setImageError] = useState(false)
  const { user, toggleBookLike, likedBooks } = useAuth()
  const navigate = useNavigate()

  const toAssetUrl = (path) => {
    if (!path) return ""
    if (path.startsWith("http://") || path.startsWith("https://")) return path
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api").replace("/api", "")
    return `${baseUrl}/${path.replace(/\\/g, "/")}`
  }
  
  const isLiked = user && likedBooks.some(likedBook => 
    likedBook._id === book._id || likedBook.id === book._id
  )

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error('Please login to like books')
      return
    }
    
    toggleBookLike(book._id || book.id)
  }

  const handleDownload = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (book.pdf) {
      const link = document.createElement('a')
      link.href = toAssetUrl(book.pdf)
      link.download = `${book.title?.replace(/\s+/g, '_') || 'book'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download started!')
    } else {
      toast.info('This book is not available for download yet')
    }
  }

  const handleReadClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/read/${book._id || book.id}`)
  }

  const bookTitle = book.title || 'Untitled Book'
  const bookAuthor = book.author || 'Unknown Author'
  const bookYear = book.publishedYear || book.year || 'N/A'
  const bookPages = book.pages || 'N/A'
  const bookCategories = book.categories || []
  const coverImage = toAssetUrl(book.coverImage)
  const averageRating = book.averageRating || 0

  return (
    <Link to={`/books/${book._id || book.id}`}>
      <motion.div 
        className="glass-card-premium rounded-xl overflow-hidden h-full flex flex-col p-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.3 }}
      >
        {/* Book Cover Container with 3D Effect */}
        <div className="py-6 flex items-center justify-center bg-transparent relative">
          <div className="book-container-3d">
            <div className="book-3d">
              <div className="book-3d-front">
                {imageError || !coverImage ? (
                  <div className="w-full h-full bg-slate-800 text-slate-400 flex flex-col items-center justify-center">
                    <FaBook className="text-3xl mb-1 text-slate-500" />
                    <span className="text-[10px]">No Cover</span>
                  </div>
                ) : (
                  <img 
                    src={coverImage} 
                    alt={bookTitle}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="book-3d-spine"></div>
              <div className="book-3d-pages"></div>
            </div>
          </div>
        </div>
        
        {/* Book Details */}
        <div className="flex flex-col flex-grow mt-2">
          <div className="flex justify-between items-start gap-1">
            <h3 className="font-semibold text-base text-white font-display line-clamp-1">
              {bookTitle}
            </h3>
            {averageRating > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-300 font-semibold shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded">
                <FaStar size={10} />
                {averageRating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-slate-300 text-xs mb-2 line-clamp-1">by {bookAuthor}</p>
          
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>{bookYear}</span>
            <span>{bookPages} pages</span>
          </div>
          
          {bookCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {bookCategories.slice(0, 2).map((category, index) => (
                <span 
                  key={index}
                  className="bg-violet-500/15 border border-violet-500/20 text-violet-200 text-[10px] px-2.5 py-0.5 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5">
            <button
              onClick={handleLike}
              className="text-slate-400 hover:text-rose-500 transition duration-300 p-1.5 rounded-lg hover:bg-white/5"
              aria-label={isLiked ? 'Unlike book' : 'Like book'}
            >
              {isLiked ? <FaHeart className="text-rose-500" size={16} /> : <FaRegHeart size={16} />}
            </button>
            
            <div className="flex space-x-1.5">
              <button
                onClick={handleReadClick}
                className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-300 flex items-center gap-1 shadow-sm hover:scale-[1.02]"
              >
                <FaBookOpen size={10} />
                Read
              </button>
              {book.pdf && (
                <button
                  onClick={handleDownload}
                  className="bg-white/10 hover:bg-white/15 border border-white/15 text-white p-1.5 rounded-lg text-xs transition duration-300 hover:scale-[1.02]"
                  title="Download Book PDF"
                >
                  <FaDownload size={10} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}