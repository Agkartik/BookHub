import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import GlassPage from "../components/GlassPage";
import {
  FaUser, FaEnvelope, FaShieldAlt, FaHeart, FaFire, FaBookOpen,
  FaTrophy, FaEdit, FaCheck, FaMusic, FaTrash, FaUpload, FaPlus, FaTimes
} from "react-icons/fa";
import {
  getMyProgress, updateReadingGoal,
  getMyUploadedMusic, uploadMusic, deleteMusic, getMyBooks
} from "../services/bookService";

export default function Profile() {
  const { user, updateProfile, likedBooks, refreshProfile, uploadProfilePicture, removeProfilePicture } = useAuth();
  const [formData, setFormData] = useState({ name: "", bio: "" });
  const [progressList, setProgressList] = useState([]);
  const [goalInput, setGoalInput] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const profilePicInputRef = useRef(null);

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    const fd = new FormData();
    fd.append("profilePic", file);

    setIsUploadingPic(true);
    try {
      await uploadProfilePicture(fd);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploadingPic(false);
    }
  };

  const handleProfilePicRemove = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    try {
      await removeProfilePicture();
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error("Failed to remove profile picture");
    }
  };

  const getProfilePicUrl = (path) => {
    if (!path) return null;
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api").replace("/api", "");
    return `${baseUrl}/${path}`;
  };

  // Music state
  const [myTracks, setMyTracks] = useState([]);
  const [showMusicUpload, setShowMusicUpload] = useState(false);
  const [musicTitle, setMusicTitle] = useState("");
  const [musicCategory, setMusicCategory] = useState("calm");
  const [musicFile, setMusicFile] = useState(null);
  const [musicBookId, setMusicBookId] = useState("");
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [myBooks, setMyBooks] = useState([]);
  const musicFileRef = useRef(null);

  useEffect(() => {
    refreshProfile().catch(() => null);
    getMyProgress()
      .then(setProgressList)
      .catch(() => setProgressList([]));
    loadMyTracks();
    // Writers load their own books for linking
  }, []);

  useEffect(() => {
    if (user?.role === "writer") {
      getMyBooks().then(setMyBooks).catch(() => setMyBooks([]));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", bio: user.bio || "" });
      setGoalInput(user.readingGoalBooks || "12");
    }
  }, [user]);

  const loadMyTracks = () => {
    getMyUploadedMusic()
      .then(setMyTracks)
      .catch(() => setMyTracks([]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await updateProfile(formData);
      toast.success("Profile details updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseInt(goalInput, 10);
    if (isNaN(parsed) || parsed < 1) {
      toast.error("Please enter a valid positive number");
      return;
    }
    try {
      await updateReadingGoal(parsed);
      await refreshProfile();
      toast.success("Annual reading goal updated!");
      setIsEditingGoal(false);
    } catch {
      toast.error("Failed to update reading goal");
    }
  };

  const handleMusicUpload = async (e) => {
    e.preventDefault();
    if (!musicFile) { toast.error("Please select an audio file."); return; }
    if (!musicTitle.trim()) { toast.error("Please enter a track title."); return; }

    // Reader hard limit: 3 tracks
    if (user?.role === "user" && myTracks.length >= 3) {
      toast.error("Readers can only have 3 custom tracks. Delete one first.");
      return;
    }

    const fd = new FormData();
    fd.append("audioFile", musicFile);
    fd.append("title", musicTitle.trim());
    fd.append("category", musicCategory);
    if (musicBookId) fd.append("bookId", musicBookId);

    setIsUploadingMusic(true);
    try {
      await uploadMusic(fd);
      toast.success("Track uploaded successfully! 🎵");
      setMusicTitle("");
      setMusicCategory("calm");
      setMusicFile(null);
      setMusicBookId("");
      setShowMusicUpload(false);
      if (musicFileRef.current) musicFileRef.current.value = "";
      loadMyTracks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed. Check file format & size.");
    } finally {
      setIsUploadingMusic(false);
    }
  };

  const handleDeleteTrack = async (id) => {
    if (!window.confirm("Remove this track?")) return;
    try {
      await deleteMusic(id);
      toast.success("Track removed.");
      loadMyTracks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete track.");
    }
  };

  const getCategoryIcon = (cat) => {
    const icons = { calm: "🌊", focus: "🎯", ambient: "🌿", custom: "🎵", writer_curated: "✍️" };
    return icons[cat] || "🎵";
  };

  const READER_LIMIT = 3;
  const tracksRemaining = user?.role === "user" ? Math.max(0, READER_LIMIT - myTracks.length) : null;

  if (!user) {
    return (
      <GlassPage>
        <div className="flex h-[60vh] items-center justify-center text-white">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-400">Loading user profile...</p>
          </div>
        </div>
      </GlassPage>
    );
  }

  const completedWorks = progressList.filter((p) => p.completed).length;
  const goalPercent = Math.min(
    100,
    Math.round((completedWorks / (user.readingGoalBooks || 12)) * 100)
  );

  return (
    <GlassPage>
      <div className="mx-auto max-w-5xl px-4 py-10">

        {/* Header Title */}
        <div className="glass-animate mb-8 flex items-center gap-3">
          <FaUser className="text-3xl text-violet-400" />
          <div>
            <h1 className="text-3xl font-bold font-display text-white">My Sanctuary Profile</h1>
            <p className="text-sm text-slate-300">Manage your credentials, bio, and review your reading metrics.</p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid gap-6 md:grid-cols-3 items-start">

          {/* Left Panel: Stats Dashboard */}
          <div className="glass-animate glass-card-premium rounded-2xl p-6 space-y-6">

            {/* User Meta */}
            <div className="text-center pb-4 border-b border-white/5">
              <div className="relative group mx-auto w-24 h-24 rounded-full overflow-hidden border border-white/20 shadow-lg shadow-violet-900/30 flex items-center justify-center bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-extrabold text-3xl">
                {user.profilePicture ? (
                  <img
                    src={getProfilePicUrl(user.profilePicture)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name ? user.name.substring(0, 2).toUpperCase() : "US"}</span>
                )}
                {/* Hover Camera Overlay */}
                <button
                  type="button"
                  onClick={() => profilePicInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity duration-300 cursor-pointer"
                  title="Upload New Photo"
                  disabled={isUploadingPic}
                >
                  <FaUpload size={14} />
                  <span>{isUploadingPic ? "Uploading..." : "Change"}</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={profilePicInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                className="hidden"
              />

              {/* Action buttons */}
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => profilePicInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-violet-600/10 hover:bg-violet-600/20 text-violet-200 border border-violet-500/20 transition cursor-pointer"
                >
                  <FaUpload size={10} /> Upload Picture
                </button>
                {user.profilePicture && (
                  <button
                    type="button"
                    onClick={handleProfilePicRemove}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition cursor-pointer"
                    title="Remove Profile Picture"
                  >
                    <FaTrash size={10} /> Remove
                  </button>
                )}
              </div>

              <h2 className="mt-3 text-lg font-bold text-white leading-none">{user.name}</h2>
              <span className="mt-2 inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold text-violet-200">
                <FaShieldAlt size={10} />
                {user.role === "writer" ? "Creator" : user.role === "admin" ? "Staff" : "Reader"}
              </span>
            </div>

            {/* Reading stats */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reader Metrics</h3>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-2 text-slate-200 text-xs">
                  <FaHeart className="text-rose-400" />
                  <span>Favorite Stories</span>
                </div>
                <span className="text-sm font-bold text-white">{likedBooks.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-2 text-slate-200 text-xs">
                  <FaFire className="text-amber-400" />
                  <span>Active Streak</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {user.streak || 0} {user.streak === 1 ? "Day" : "Days"} 🔥
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-2 text-slate-200 text-xs">
                  <FaBookOpen className="text-sky-400" />
                  <span>Completed Works</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {completedWorks} {completedWorks === 1 ? "Volume" : "Volumes"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-2 text-slate-200 text-xs">
                  <FaTrophy className="text-yellow-400" />
                  <span>Total Reading Time</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {user.totalReadingTime || 0} min
                </span>
              </div>
            </div>

            {/* Reading Goal Progress Widget */}
            <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-violet-300">Annual Reading Goal</span>
                <span className="text-white font-bold">{goalPercent}%</span>
              </div>

              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${goalPercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>{completedWorks} of {user.readingGoalBooks || 12} books</span>
                {isEditingGoal ? (
                  <form onSubmit={handleGoalSubmit} className="flex items-center gap-1">
                    <input
                      type="number"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="w-12 bg-slate-900 border border-white/10 rounded px-1 py-0.5 text-white text-right focus:outline-none"
                    />
                    <button type="submit" className="text-emerald-400 hover:text-emerald-300 cursor-pointer">
                      <FaCheck size={10} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsEditingGoal(true)}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                  >
                    <FaEdit size={10} /> Edit Goal
                  </button>
                )}
              </div>
            </div>

            {/* Email disclosure */}
            <div className="flex items-center gap-2.5 text-xs text-slate-400 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
              <FaEnvelope className="shrink-0 text-slate-500" />
              <span className="line-clamp-1">{user.email}</span>
            </div>

          </div>

          {/* Right Panel Column */}
          <div className="md:col-span-2 space-y-6">

            {/* Profile Edit Form */}
            <div className="glass-animate glass-card-premium rounded-2xl p-6 space-y-5">
              <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-2 font-display">Edit Profile Details</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Display Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm glass-input-premium focus:outline-none"
                    placeholder="Display name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Writer Bio / Description</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                    className="w-full rounded-xl p-4 text-sm glass-input-premium focus:outline-none"
                    rows={4}
                    placeholder="Write a brief statement about your favorite genres, books, or writing inspirations..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition duration-300 hover:scale-[1.01] shadow-lg shadow-violet-900/10 cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>

            {/* ──── Ambient Music Manager ──── */}
            <div className="glass-animate glass-card-premium rounded-2xl p-6 space-y-4">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <FaMusic className="text-emerald-400 text-lg" />
                  <div>
                    <h3 className="text-base font-bold text-white font-display">My Ambient Tracks</h3>
                    {user.role === "user" && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {myTracks.length}/{READER_LIMIT} slots used · Delete a track to free a slot
                      </p>
                    )}
                    {user.role === "writer" && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Curate tracks for your book readers
                      </p>
                    )}
                    {user.role === "admin" && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Admin · unlimited global track uploads
                      </p>
                    )}
                  </div>
                </div>

                {/* Upload toggle – disabled for reader at limit */}
                {(user.role !== "user" || myTracks.length < READER_LIMIT) ? (
                  <button
                    onClick={() => setShowMusicUpload(!showMusicUpload)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      showMusicUpload
                        ? "bg-white/10 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {showMusicUpload ? <FaTimes size={10} /> : <FaPlus size={10} />}
                    {showMusicUpload ? "Cancel" : "Add Track"}
                  </button>
                ) : (
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">
                    Limit Reached
                  </span>
                )}
              </div>

              {/* Upload Form */}
              {showMusicUpload && (
                <form
                  onSubmit={handleMusicUpload}
                  className="rounded-xl bg-emerald-950/30 border border-emerald-500/15 p-4 space-y-3"
                >
                  <p className="text-xs font-semibold text-emerald-300">Upload New Track</p>

                  {/* Track Title */}
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Track Title *</label>
                    <input
                      value={musicTitle}
                      onChange={e => setMusicTitle(e.target.value)}
                      placeholder="E.g. Rainy Coffee Shop, Deep Focus…"
                      className="w-full rounded-lg px-3 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Category */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                      <select
                        value={musicCategory}
                        onChange={e => setMusicCategory(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-xs bg-slate-900 border border-white/10 text-white focus:outline-none"
                      >
                        <option value="calm">🌊 Calm</option>
                        <option value="focus">🎯 Focus</option>
                        <option value="ambient">🌿 Ambient</option>
                        <option value="custom">🎵 Custom</option>
                        {user.role === "writer" && <option value="writer_curated">✍️ Writer Curated</option>}
                      </select>
                    </div>

                    {/* Book Link (Writers only) */}
                    {user.role === "writer" && (
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Link to Book (optional)</label>
                        <select
                          value={musicBookId}
                          onChange={e => setMusicBookId(e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-xs bg-slate-900 border border-white/10 text-white focus:outline-none"
                        >
                          <option value="">— Global Track —</option>
                          {myBooks.map(b => (
                            <option key={b._id} value={b._id}>{b.title.substring(0, 30)}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* File picker */}
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Audio File * (MP3, WAV, OGG, FLAC · max 15 MB)</label>
                    <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-dashed border-white/15 bg-white/3 hover:bg-white/6 px-4 py-3 transition">
                      <FaUpload className="text-slate-400 shrink-0" size={14} />
                      <span className="text-xs text-slate-300 truncate">
                        {musicFile ? musicFile.name : "Click to select audio file…"}
                      </span>
                      <input
                        ref={musicFileRef}
                        type="file"
                        accept=".mp3,.wav,.ogg,.flac,audio/*"
                        className="hidden"
                        onChange={e => setMusicFile(e.target.files[0] || null)}
                        required
                      />
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowMusicUpload(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploadingMusic}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer"
                    >
                      {isUploadingMusic ? "Uploading…" : "Upload Track"}
                    </button>
                  </div>
                </form>
              )}

              {/* Tracks list */}
              {myTracks.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <FaMusic size={28} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs">No tracks uploaded yet.</p>
                  <p className="text-[10px] mt-1 text-slate-600">
                    {user.role === "user"
                      ? "Upload up to 3 personal ambient tracks."
                      : "Upload tracks for your readers."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myTracks.map(track => (
                    <div
                      key={track._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition"
                    >
                      <span className="text-xl shrink-0">{getCategoryIcon(track.category)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                          {track.category?.replace("_", " ")}
                          {track.book?.title && (
                            <span className="ml-1.5 text-rose-300">· {track.book.title.substring(0, 25)}</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteTrack(track._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer shrink-0"
                        title="Delete track"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Reader slot indicator */}
                  {user.role === "user" && (
                    <div className="flex gap-1 pt-1">
                      {Array.from({ length: READER_LIMIT }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < myTracks.length
                              ? "bg-emerald-500"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>{/* end right column */}
        </div>
      </div>
    </GlassPage>
  );
}