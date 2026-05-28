import { useEffect, useState } from "react";
import { getMoodRecommendations } from "../services/bookService";
import GlassPage from "../components/GlassPage";
import BookCard from "../components/BookCard";

const moods = ["focus", "thrill", "calm", "inspire", "escape"];

export default function MoodLab() {
  const [mood, setMood] = useState("focus");
  const [data, setData] = useState({ books: [], rationale: "", categories: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await getMoodRecommendations(mood);
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [mood]);

  return (
    <GlassPage>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="glass-animate text-3xl font-bold">AI Mood Lab</h1>
        <p className="glass-animate mt-2 text-slate-300">Pick a mood and get curated recommendations.</p>
        <div className="glass-animate mt-5 flex flex-wrap gap-2">
          {moods.map((item) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 capitalize ${item === mood ? "bg-violet-600 text-white" : "bg-white/10 border border-white/20"}`}
              onClick={() => setMood(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="glass-animate mt-4 rounded-lg border border-white/20 bg-white/10 p-4">
          <p className="text-sm text-slate-200">{loading ? "Thinking..." : data.rationale}</p>
          <p className="mt-1 text-xs text-slate-400">Categories: {(data.categories || []).join(", ")}</p>
        </div>
        <div className="glass-animate mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(data.books || []).map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </div>
    </GlassPage>
  );
}
