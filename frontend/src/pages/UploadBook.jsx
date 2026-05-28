import { useState, useEffect } from "react";
import { uploadBook, getMusic, uploadMusic } from "../services/bookService";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import GlassPage from "../components/GlassPage";
import { FaBook, FaPenNib, FaLanguage, FaFilePdf, FaImage, FaTags, FaMusic, FaPlus, FaTimes, FaUpload } from "react-icons/fa";

export default function UploadBook() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    categories: "",
    moods: "",
    pages: "",
    language: "English",
    publishedYear: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [musicTracks, setMusicTracks] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState("");

  const [showMusicUpload, setShowMusicUpload] = useState(false);
  const [newMusicTitle, setNewMusicTitle] = useState("");
  const [newMusicFile, setNewMusicFile] = useState(null);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);

  const handleQuickMusicUpload = async (e) => {
    e.preventDefault();
    if (!newMusicFile) {
      toast.error("Please select an audio file first");
      return;
    }
    if (!newMusicTitle.trim()) {
      toast.error("Please provide a track title");
      return;
    }

    const fd = new FormData();
    fd.append("audioFile", newMusicFile);
    fd.append("title", newMusicTitle.trim());
    fd.append("category", "custom");

    setIsUploadingMusic(true);
    try {
      const track = await uploadMusic(fd);
      toast.success("Background music uploaded and selected!");
      
      // Add new track to the list and select it
      setMusicTracks((prev) => [track, ...prev]);
      setSelectedMusic(track._id);
      
      // Clear forms
      setNewMusicTitle("");
      setNewMusicFile(null);
      setShowMusicUpload(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload background music");
    } finally {
      setIsUploadingMusic(false);
    }
  };

  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, author: user.name }));
    }
    getMusic()
      .then(setMusicTracks)
      .catch(() => setMusicTracks([]));
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Please upload a PDF file for your book");
      return;
    }

    setIsSubmitting(true);
    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "categories") {
        fd.append("categories", JSON.stringify(form.categories.split(",").map((c) => c.trim()).filter(Boolean)));
      } else if (key === "moods") {
        fd.append("moods", JSON.stringify(form.moods.split(",").map((m) => m.trim()).filter(Boolean)));
      } else {
        fd.append(key, form[key]);
      }
    });
    if (coverImage) fd.append("coverImage", coverImage);
    if (pdfFile) fd.append("pdfFile", pdfFile);
    if (selectedMusic) fd.append("musicTrack", selectedMusic);

    try {
      await uploadBook(fd);
      toast.success("Book uploaded successfully!");
      setForm({
        title: "",
        author: user?.name || "",
        description: "",
        categories: "",
        moods: "",
        pages: "",
        language: "English",
        publishedYear: "",
      });
      setCoverImage(null);
      setPdfFile(null);
      setSelectedMusic("");
      // Reset file inputs
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload book");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassPage>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="glass-animate mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white">Publish Your Book</h1>
          <p className="mt-2 text-slate-300">Share your digital manuscript with the BookVerse community. Keep it secure and polished.</p>
        </div>

        <form onSubmit={submit} className="glass-card-premium space-y-6 rounded-2xl p-6 md:p-8">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">Book Title</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <FaBook size={14} />
              </span>
              <input 
                required 
                value={form.title} 
                className="w-full pl-10 rounded-lg px-4 py-3 text-sm glass-input-premium focus:outline-none" 
                placeholder="e.g. The Quantum Horizon" 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">Author (Enforced)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <FaPenNib size={14} />
                </span>
                <input 
                  disabled 
                  value={form.author} 
                  className="w-full pl-10 rounded-lg px-4 py-3 text-sm glass-input-premium focus:outline-none opacity-60 cursor-not-allowed bg-white/5 text-slate-400" 
                  placeholder="Author name" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">Language</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <FaLanguage size={14} />
                </span>
                <input 
                  required 
                  value={form.language} 
                  className="w-full pl-10 rounded-lg px-4 py-3 text-sm glass-input-premium focus:outline-none" 
                  placeholder="e.g. English" 
                  onChange={(e) => setForm({ ...form, language: e.target.value })} 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">Description</label>
            <textarea 
              required 
              value={form.description} 
              className="w-full rounded-lg px-4 py-3 text-sm glass-input-premium focus:outline-none h-32 resize-none" 
              placeholder="Provide a compelling synopsis of your story..." 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">Genres / Categories</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <FaTags size={14} />
                </span>
                <input 
                  value={form.categories} 
                  className="w-full pl-10 rounded-lg px-4 py-3 text-sm glass-input-premium focus:outline-none" 
                  placeholder="e.g. Sci-Fi, Fantasy, Mystery" 
                  onChange={(e) => setForm({ ...form, categories: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">Mood Tags</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  ✨
                </span>
                <input 
                  value={form.moods} 
                  className="w-full pl-10 rounded-lg px-4 py-3 text-sm glass-input-premium focus:outline-none" 
                  placeholder="e.g. Thrill, Inspire, Focus, Calm" 
                  onChange={(e) => setForm({ ...form, moods: e.target.value })} 
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">Pages count</label>
              <input 
                type="number" 
                value={form.pages} 
                className="w-full rounded-lg px-4 py-3 text-sm glass-input-premium focus:outline-none" 
                placeholder="e.g. 340" 
                onChange={(e) => setForm({ ...form, pages: e.target.value })} 
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">Published Year</label>
              <input 
                type="number" 
                value={form.publishedYear} 
                className="w-full rounded-lg px-4 py-3 text-sm glass-input-premium focus:outline-none" 
                placeholder="e.g. 2026" 
                onChange={(e) => setForm({ ...form, publishedYear: e.target.value })} 
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold block">Link Background Music (Optional)</label>
              <button
                type="button"
                onClick={() => setShowMusicUpload(!showMusicUpload)}
                className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-white transition duration-200 cursor-pointer"
              >
                {showMusicUpload ? (
                  <>
                    <FaTimes size={10} /> Select Existing
                  </>
                ) : (
                  <>
                    <FaPlus size={10} /> Upload New Music
                  </>
                )}
              </button>
            </div>

            {!showMusicUpload ? (
              <div className="relative">
                <select
                  value={selectedMusic}
                  onChange={(e) => setSelectedMusic(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm glass-input-premium bg-slate-900 text-white focus:outline-none"
                >
                  <option value="">— No Background Music —</option>
                  {musicTracks.map((track) => (
                    <option key={track._id} value={track._id}>
                      {track.title} ({track.category?.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-4 space-y-3">
                <p className="text-xs font-semibold text-violet-300">Upload New Background Track</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Track Title *</label>
                    <input
                      type="text"
                      value={newMusicTitle}
                      onChange={(e) => setNewMusicTitle(e.target.value)}
                      placeholder="e.g. Dreamy Rain, Reading Chill..."
                      className="w-full rounded-lg px-3 py-2 text-xs bg-slate-900 border border-white/10 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Audio File *</label>
                    <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 transition text-xs">
                      <FaUpload className="text-slate-400" size={10} />
                      <span className="text-slate-300 truncate">
                        {newMusicFile ? newMusicFile.name : "Select audio file..."}
                      </span>
                      <input
                        type="file"
                        accept=".mp3,.wav,.ogg,.m4a,audio/*"
                        className="hidden"
                        onChange={(e) => setNewMusicFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNewMusicTitle("");
                      setNewMusicFile(null);
                      setShowMusicUpload(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickMusicUpload}
                    disabled={isUploadingMusic}
                    className="px-4 py-1.5 rounded-lg text-[10px] font-semibold bg-violet-600 hover:bg-violet-750 text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingMusic ? "Uploading..." : "Upload & Select"}
                  </button>
                </div>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-1">If linked, readers will hear this song by default and cannot change it.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-dashed border-white/20 rounded-xl p-4 bg-white/[0.02] flex flex-col items-center justify-center text-center">
              <FaImage size={24} className="text-violet-400 mb-2" />
              <label className="text-xs font-semibold text-slate-200 cursor-pointer hover:text-white transition">
                Upload Cover Image
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)} 
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP formats allowed</p>
              {coverImage && <p className="text-xs text-emerald-400 mt-2 font-medium">Selected: {coverImage.name}</p>}
            </div>

            <div className="border border-dashed border-white/20 rounded-xl p-4 bg-white/[0.02] flex flex-col items-center justify-center text-center">
              <FaFilePdf size={24} className="text-rose-400 mb-2" />
              <label className="text-xs font-semibold text-slate-200 cursor-pointer hover:text-white transition">
                Upload Book PDF *
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)} 
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-1">PDF book format required</p>
              {pdfFile && <p className="text-xs text-emerald-400 mt-2 font-medium">Selected: {pdfFile.name}</p>}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-center transition duration-300 shadow-lg shadow-violet-900/30"
          >
            {isSubmitting ? "Uploading Book..." : "Publish Book"}
          </button>
        </form>
      </div>
    </GlassPage>
  );
}
