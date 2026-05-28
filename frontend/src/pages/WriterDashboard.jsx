import { useEffect, useState } from "react";
import { getWriterDashboard } from "../services/bookService";
import GlassPage from "../components/GlassPage";

export default function WriterDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getWriterDashboard().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <GlassPage><div className="p-8">Loading writer analytics...</div></GlassPage>;

  const cards = [
    { label: "Books Published", value: data.totalBooks },
    { label: "Total Reviews", value: data.totalReviews },
    { label: "Average Rating", value: data.averageRating },
    { label: "Active Readers", value: data.activeReaders },
  ];

  return (
    <GlassPage>
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="glass-animate mb-6 text-3xl font-bold">Writer Dashboard</h1>
      <div className="glass-animate grid grid-cols-1 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-white/20 bg-white/10 p-5 shadow-sm">
            <p className="text-sm text-slate-200">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
      <h2 className="mb-3 mt-8 text-xl font-semibold">Recent Books</h2>
      <div className="space-y-3">
        {data.recentBooks.map((book) => (
          <article key={book._id} className="glass-animate rounded-lg border border-white/20 bg-white/10 p-4">
            <p className="font-semibold">{book.title}</p>
            <p className="text-sm text-slate-200">
              Rating {book.averageRating?.toFixed(1) || 0} • {book.reviewCount || 0} reviews
            </p>
          </article>
        ))}
      </div>
    </div>
    </GlassPage>
  );
}
