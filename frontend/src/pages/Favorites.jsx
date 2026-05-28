import { useEffect, useState } from "react";
import { getFavorites } from "../services/bookService";
import BookCard from "../components/BookCard";
import GlassPage from "../components/GlassPage";

export default function Favorites() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getFavorites().then(setBooks).catch(() => setBooks([]));
  }, []);

  return (
    <GlassPage>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="glass-animate text-3xl font-bold font-display text-white">Your Reading Sanctuary</h1>
        <p className="glass-animate mt-1 text-slate-300 mb-8">All the stories and reference works you've bookmarked to read later.</p>
        
        <div className="glass-animate grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {books.length === 0 ? (
            <p className="text-slate-400 text-sm italic col-span-full py-8 text-center bg-white/[0.02] border border-white/5 rounded-xl">
              No favorite books marked yet. Browse the Shelves to add some!
            </p>
          ) : (
            books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))
          )}
        </div>
      </div>
    </GlassPage>
  );
}
