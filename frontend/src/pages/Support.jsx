import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { FaQuestionCircle, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa'
import GlassPage from '../components/GlassPage'

export default function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    issueType: 'general'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Your message has been sent! We will get back to you soon.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        issueType: 'general'
      })
      setLoading(false)
    }, 1500)
  }

  const faqItems = [
    {
      question: "How do I download a book?",
      answer: "Simply navigate to the library, find the book you want, and click the download button on the book card. The book will be downloaded in PDF format."
    },
    {
      question: "Can I read books without downloading?",
      answer: "Yes! Click the 'Read' button on any book card to read it directly in your browser without downloading."
    },
    {
      question: "How do I save books to my favorites?",
      answer: "Click the heart icon on any book card to add it to your liked books collection. You need to be logged in to use this feature."
    },
    {
      question: "Is there a limit to how many books I can download?",
      answer: "No, there are no limits. You can download as many books as you want from our library."
    }
  ]

  return (
    <GlassPage>
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-center text-gray-800 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Support Center
        </motion.h1>
        <motion.p 
          className="text-center text-gray-600 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          We're here to help you with any questions or issues
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div 
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl shadow-md p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <FaExclamationTriangle className="text-purple-600 mr-2" />
              Report an Issue
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type
                </label>
                <select
                  id="issueType"
                  name="issueType"
                  className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.issueType}
                  onChange={handleChange}
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Issue</option>
                  <option value="content">Content Problem</option>
                  <option value="account">Account Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition duration-300 flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
                <FaPaperPlane className="ml-2" />
              </button>
            </form>
          </motion.div>

          {/* FAQ Section */}
          <motion.div 
            className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-xl shadow-md p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <FaQuestionCircle className="text-purple-600 mr-2" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  className="border-b border-white/20 pb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="font-semibold text-lg text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-slate-200">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-purple-500/20 rounded-lg">
              <h3 className="font-semibold text-violet-100 mb-2">Can't find what you're looking for?</h3>
              <p className="text-violet-200">
                Contact us directly using the form and we'll get back to you as soon as possible.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </GlassPage>
  )
}