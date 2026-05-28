import { useEffect, useState } from "react";
import { deleteAdminBook, deleteAdminUser, getAdminBooks, getAdminOverview, getAdminReports, getAdminUsers, resolveAdminReport, updateAdminBook } from "../services/bookService";
import { toast } from "react-toastify";
import GlassPage from "../components/GlassPage";
import { useAuth } from "../hooks/useAuth";

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [reports, setReports] = useState([]);

  const load = async () => {
    const [o, u, b, r] = await Promise.all([getAdminOverview(), getAdminUsers(), getAdminBooks(), getAdminReports()]);
    setOverview(o);
    setUsers(u);
    setBooks(b);
    setReports(r);
  };

  useEffect(() => {
    load().catch(() => null);
  }, []);

  const saveBook = async () => {
    await updateAdminBook(editing._id, {
      title: editing.title,
      author: editing.author,
      categories: editing.categories,
      language: editing.language,
      description: editing.description,
      publishedYear: editing.publishedYear,
      pages: editing.pages,
    });
    toast.success("Book updated");
    setEditing(null);
    load();
  };

  const removeBook = async (id) => {
    await deleteAdminBook(id);
    toast.success("Book deleted");
    load();
  };

  const removeUser = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user? This will also delete all their books, reviews, and reading progress.")) return;
    try {
      await deleteAdminUser(id);
      toast.success("User removed successfully");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove user");
    }
  };

  const resolveReport = async (id) => {
    await resolveAdminReport(id, { resolutionNote: "Reviewed by admin" });
    toast.success("Report resolved");
    load();
  };

  return (
    <GlassPage>
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="glass-animate mb-6 text-3xl font-bold">Admin Panel</h1>
      {overview && (
        <div className="glass-animate mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Object.entries(overview).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-slate-300">{k}</p>
              <p className="text-xl font-semibold">{v}</p>
            </div>
          ))}
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Books Management</h2>
        <div className="space-y-2">
          {books.map((book) => (
            <div key={book._id} className="glass-animate flex items-center justify-between rounded border border-white/20 bg-white/10 p-3">
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-slate-300">{book.author} • {book.language || "N/A"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing({ ...book })} className="rounded bg-indigo-600 px-3 py-1 text-sm text-white">Edit</button>
                <button onClick={() => removeBook(book._id)} className="rounded bg-red-600 px-3 py-1 text-sm text-white">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Moderation Reports</h2>
        <div className="space-y-2">
          {reports.slice(0, 20).map((report) => (
            <div key={report._id} className="glass-animate rounded border border-white/20 bg-white/10 p-3">
              <p className="font-medium">{report.targetType.toUpperCase()} - {report.reason}</p>
              <p className="text-sm text-slate-300">{report.details || "No details provided"}</p>
              <p className="text-xs text-slate-400">By: {report.reportedBy?.name} • Status: {report.status}</p>
              {report.status === "open" && (
                <button className="mt-2 rounded bg-violet-600 px-3 py-1 text-sm text-white" onClick={() => resolveReport(report._id)}>
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Users</h2>
        <div className="glass-animate rounded-xl border border-white/10 bg-slate-950/40 p-1 divide-y divide-white/5">
          {users.slice(0, 25).map((u) => (
            <div key={u._id} className="flex items-center justify-between p-4 transition hover:bg-white/[0.02]">
              <div>
                <p className="font-semibold text-white">{u.name}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  u.role === "admin" ? "bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300" :
                  u.role === "writer" ? "bg-violet-500/10 border border-violet-500/20 text-violet-300" :
                  "bg-slate-500/10 border border-slate-500/20 text-slate-300"
                }`}>{u.role}</span>
                {u._id !== currentUser?._id && (
                  <button 
                    onClick={() => removeUser(u._id)} 
                    className="rounded-lg bg-red-650/80 hover:bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition duration-300 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6">
            <h3 className="mb-4 text-xl font-semibold">Edit Book</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded border p-2" value={editing.title || ""} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} placeholder="Title" />
              <input className="rounded border p-2" value={editing.author || ""} onChange={(e) => setEditing((p) => ({ ...p, author: e.target.value }))} placeholder="Author" />
              <input className="rounded border p-2" value={editing.language || ""} onChange={(e) => setEditing((p) => ({ ...p, language: e.target.value }))} placeholder="Language" />
              <input type="number" className="rounded border p-2" value={editing.publishedYear || ""} onChange={(e) => setEditing((p) => ({ ...p, publishedYear: Number(e.target.value) }))} placeholder="Year" />
              <input type="number" className="rounded border p-2" value={editing.pages || ""} onChange={(e) => setEditing((p) => ({ ...p, pages: Number(e.target.value) }))} placeholder="Pages" />
              <input className="rounded border p-2" value={(editing.categories || []).join(", ")} onChange={(e) => setEditing((p) => ({ ...p, categories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} placeholder="Genres" />
            </div>
            <textarea className="mt-3 w-full rounded border p-2" rows={4} value={editing.description || ""} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded border px-3 py-2">Cancel</button>
              <button onClick={saveBook} className="rounded bg-purple-600 px-3 py-2 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </GlassPage>
  );
}
