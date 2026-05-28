import { motion } from 'framer-motion'
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaHeart
} from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 border-t border-white/5 text-white py-12 relative z-10 w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-purple-500 mr-2">Book</span>Hub
            </h3>
            <p className="text-gray-400 mb-6">
              Discover thousands of books across various genres. Read, download, and explore the world of literature with BookHub.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition duration-300">Home</a></li>
              <li><a href="/library" className="text-gray-400 hover:text-white transition duration-300">Library</a></li>
              <li><a href="/favorites" className="text-gray-400 hover:text-white transition duration-300">Favorites</a></li>
              <li><a href="/support" className="text-gray-400 hover:text-white transition duration-300">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="/support" className="text-gray-400 hover:text-white transition duration-300">Help Center</a></li>
              <li><a href="/support" className="text-gray-400 hover:text-white transition duration-300">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} BookHub. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center mt-2 md:mt-0">
            Made with <FaHeart className="text-red-500 mx-1" /> by the BookHub Team
          </p>
        </div>
      </div>
    </footer>
  )
}