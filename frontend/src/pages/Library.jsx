import { useEffect, useState } from "react";
import { getBooks } from "../services/bookService";
import BookCard from "../components/BookCard";
import GlassPage from "../components/GlassPage";
import { motion } from "framer-motion";

export default function Library() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("latest");
  const [mood, setMood] = useState("");

  const [allCategories, setAllCategories] = useState([]);
  const [allMoods, setAllMoods] = useState([]);

  useEffect(() => {
    getBooks().then((allBooks) => {
      const cats = [...new Set(allBooks.flatMap((b) => b.categories || []))];
      const mds = [...new Set(allBooks.flatMap((b) => b.moods || []))];
      setAllCategories(cats);
      setAllMoods(mds);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    getBooks({ search, category, language, minRating, sort, mood }).then(setBooks).catch(() => setBooks([]));
  }, [search, category, language, minRating, sort, mood]);

  const categories = allCategories;
  const moods = allMoods;
  const languages = [...new Set(books.map((book) => book.language).filter(Boolean))];

  return (
    <GlassPage>
      <div className="mx-auto max-w-7xl px-4 py-8">
        
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-animate mb-6 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-violet-300 font-semibold font-display">BookVerse Sanctuary</p>
          <h2 className="mt-1 text-3xl font-bold font-display text-white">Dive Into Infinite Chapters & Curated Stories</h2>
          <p className="mt-2 text-slate-300">A digital sanctuary for reading progress tracking, community reviews, and curated library collections.</p>
        </motion.div>

        {/* Filters Panel */}
        <div className="glass-animate mb-6 grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or author"
            className="w-full rounded-lg px-4 py-2 text-sm glass-input-premium focus:outline-none"
          />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="rounded-lg px-4 py-2 text-sm glass-input-premium focus:outline-none"
          >
            <option value="" className="bg-slate-900 text-white">All categories</option>
            {categories.map((item) => <option key={item} value={item} className="bg-slate-900 text-white">{item}</option>)}
          </select>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
            className="rounded-lg px-4 py-2 text-sm glass-input-premium focus:outline-none"
          >
            <option value="" className="bg-slate-900 text-white">All languages</option>
            {languages.map((item) => <option key={item} value={item} className="bg-slate-900 text-white">{item}</option>)}
          </select>
          <select 
            value={minRating} 
            onChange={(e) => setMinRating(e.target.value)} 
            className="rounded-lg px-4 py-2 text-sm glass-input-premium focus:outline-none"
          >
            <option value="" className="bg-slate-900 text-white">Any rating</option>
            <option value="4" className="bg-slate-900 text-white">4+ stars</option>
            <option value="3" className="bg-slate-900 text-white">3+ stars</option>
            <option value="2" className="bg-slate-900 text-white">2+ stars</option>
            <option value="1" className="bg-slate-900 text-white">1+ stars</option>
          </select>
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)} 
            className="rounded-lg px-4 py-2 text-sm glass-input-premium focus:outline-none"
          >
            <option value="latest" className="bg-slate-900 text-white">Latest Added</option>
            <option value="top" className="bg-slate-900 text-white">Top Rated</option>
            <option value="title" className="bg-slate-900 text-white">Title A-Z</option>
            <option value="oldest" className="bg-slate-900 text-white">Oldest</option>
          </select>
        </div>

        {/* Mood Chips */}
        <div className="glass-animate mb-6 flex flex-wrap gap-2">
          {moods.map((item) => (
            <button
              key={item}
              onClick={() => {
                const selected = mood === item ? "" : item;
                setMood(selected);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all duration-300 ${
                mood === item 
                  ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20" 
                  : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/10"
              }`}
            >
              {item} Mode
            </button>
          ))}
        </div>

        {/* Scrolling Quotes Marquee */}
        <div className="glass-animate mb-8 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="hero-marquee flex gap-12 whitespace-nowrap text-xs text-slate-300 font-medium">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex gap-12 shrink-0">
                {[
                  "A room without books is like a body without a soul. — Cicero",
                  "Reading is a conversation. All books talk. But a good book listens as well. — Mark Haddon",
                  "To read is to fly: it is to soar to a point of vantage. — A.C. Grayling",
                  "Books are a uniquely portable magic. — Stephen King",
                  "Today a reader, tomorrow a leader. — Margaret Fuller"
                ].map((txt) => (
                  <span key={`${idx}-${txt}`}>{txt}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Books List Grid */}
        <div className="glass-animate grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
        
      </div>
    </GlassPage>
  );
}
