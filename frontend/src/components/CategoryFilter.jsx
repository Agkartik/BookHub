// import { motion } from 'framer-motion'

// export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
//   return (
//     <div className="flex flex-wrap gap-2">
//       {categories.map((category, index) => (
//         <motion.button
//           key={category}
//           className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 ${
//             selectedCategory === category
//               ? 'bg-purple-600 text-white'
//               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//           }`}
//           onClick={() => onSelectCategory(category)}
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.2, delay: index * 0.05 }}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           {category}
//         </motion.button>
//       ))}
//     </div>
//   )
// }


//add
// src/components/CategoryFilter.jsx
import { motion } from 'framer-motion'

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  // Ensure categories is always an array
  const safeCategories = categories || []
  
  return (
    <div className="flex flex-wrap gap-2">
      {safeCategories.map((category, index) => (
        <motion.button
          key={category || index}
          className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 ${
            selectedCategory === category
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => onSelectCategory(category)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {category}
        </motion.button>
      ))}
    </div>
  )
}