import { useEffect, useMemo, useState } from "react";
import { getBooks } from "../services/bookService";
import GlassPage from "../components/GlassPage";
import BookCard from "../components/BookCard";

export default function Catalog() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getBooks().then(setBooks).catch(() => setBooks([]));
  }, []);

  const sections = useMemo(() => {
    const sortedByRating = [...books].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    const sortedByDate = [...books].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return {
      trending: sortedByRating.slice(0, 8),
      newArrivals: sortedByDate.slice(0, 8),
      collections: books.filter((b) => (b.categories || []).includes("Mystery") || (b.categories || []).includes("Science Fiction")).slice(0, 8),
    };
  }, [books]);

  return (
    <GlassPage>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="glass-animate text-3xl font-bold font-display text-white">Curated Shelves</h1>
        <p className="glass-animate mt-1 text-slate-300">Handpicked collections and trending reads selected by our editors.</p>

        {[
          ["Top Rated Readings", sections.trending],
          ["Recently Added", sections.newArrivals],
          ["Curated Genres", sections.collections],
        ].map(([label, list]) => (
          <section key={label} className="mt-10">
            <h2 className="glass-animate mb-4 text-2xl font-semibold font-display text-white border-b border-white/5 pb-2">{label}</h2>
            <div className="glass-animate grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {list.length === 0 ? (
                <p className="text-slate-400 text-sm italic col-span-full">No books available in this collection yet.</p>
              ) : (
                list.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </GlassPage>
  );
}
