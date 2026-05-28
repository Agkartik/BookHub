import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { addReview, addReviewComment, createReport, getBook, getRecommendations, getReviewComments, getReviews, saveProgress, updateReview, getMyProgress } from "../services/bookService";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import GlassPage from "../components/GlassPage";
import { motion } from "framer-motion";
import { FaBookOpen, FaDownload, FaStar, FaChevronRight, FaFlag, FaReply, FaBook } from "react-icons/fa";
import gsap from "gsap";
import { applyMoodTheme } from "../utils/moodThemes";

import { toAssetUrl } from "../services/api";

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [threadMap, setThreadMap] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [progress, setProgress] = useState(0);
  const [reportReason, setReportReason] = useState("");
  const [imageError, setImageError] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const detailContainerRef = useRef(null);

  useEffect(() => {
    getBook(id).then((data) => {
      setBook(data);
      applyMoodTheme(data.moods, data.categories);
    }).catch(() => toast.error("Error loading book details"));

    if (user) {
      getMyProgress()
        .then((items) => {
          const matched = items.find((item) => String(item.book?._id || item.book) === String(id));
          if (matched) {
            setProgress(matched.progressPercent || 0);
          }
        })
        .catch(() => {});
    }
    
    getReviews(id).then(setReviews).catch(() => setReviews([]));
    getRecommendations().then(setRecommendations).catch(() => setRecommendations([]));

    return () => {
      document.documentElement.classList.remove("mood-thrill", "mood-nature", "mood-dreamy", "mood-mystery", "mood-calm");
    };
  }, [id, user]);

  useEffect(() => {
    const loadThreads = async () => {
      const pairs = await Promise.all(
        reviews.map(async (r) => {
          try {
            const comments = await getReviewComments(r._id);
            return [r._id, comments];
          } catch {
            return [r._id, []];
          }
        })
      );
      setThreadMap(Object.fromEntries(pairs));
    };
    if (reviews.length) loadThreads();
  }, [reviews]);

  useEffect(() => {
    if (book && detailContainerRef.current) {
      const animEls = detailContainerRef.current.querySelectorAll(".animate-detail-item");
      if (animEls.length > 0) {
        gsap.fromTo(
          animEls,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
      }
    }
  }, [book]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) {
      toast.error("Please add a comment to your review");
      return;
    }
    try {
      await addReview(id, form);
      setForm({ rating: 5, comment: "" });
      const next = await getReviews(id);
      setReviews(next);
      const nextBook = await getBook(id);
      setBook(nextBook);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editForm.comment.trim()) {
      toast.error("Please add a comment to your review");
      return;
    }
    try {
      await updateReview(editingReviewId, editForm);
      setEditingReviewId(null);
      const next = await getReviews(id);
      setReviews(next);
      const nextBook = await getBook(id);
      setBook(nextBook);
      toast.success("Review updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update review");
    }
  };

  const submitComment = async (reviewId, parent = null) => {
    const text = commentInput[`${reviewId}:${parent || "root"}`];
    if (!text?.trim()) return;
    try {
      await addReviewComment(reviewId, { comment: text, parent });
      const comments = await getReviewComments(reviewId);
      setThreadMap((p) => ({ ...p, [reviewId]: comments }));
      setCommentInput((p) => ({ ...p, [`${reviewId}:${parent || "root"}`]: "" }));
      toast.success("Reply added");
    } catch {
      toast.error("Failed to add reply");
    }
  };

  const updateProgress = async () => {
    try {
      await saveProgress(id, { progressPercent: Number(progress), lastPage: 0 });
      toast.success(`Progress saved at ${progress}%`);
    } catch {
      toast.error("Failed to save progress");
    }
  };

  const reportBook = async () => {
    if (!reportReason.trim()) return;
    try {
      await createReport({
        targetType: "book",
        targetId: id,
        reason: reportReason,
        details: `Reported from book detail page: ${book.title}`,
      });
      setReportReason("");
      toast.success("Report submitted to moderation team");
    } catch {
      toast.error("Failed to submit report");
    }
  };

  const handleDownload = () => {
    if (book.pdf) {
      const link = document.createElement('a');
      link.href = toAssetUrl(book.pdf);
      link.download = `${book.title?.replace(/\s+/g, '_') || 'book'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    }
  };

  if (!book) {
    return (
      <GlassPage>
        <div className="flex min-h-[60vh] items-center justify-center text-white">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-300">Loading book details...</p>
          </div>
        </div>
      </GlassPage>
    );
  }

  const coverImage = toAssetUrl(book.coverImage);

  return (
    <GlassPage>
      <div ref={detailContainerRef} className="mx-auto max-w-6xl px-4 py-8">
        
        {/* Breadcrumbs */}
        <div className="animate-detail-item mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-purple-300 transition">Home</Link>
          <FaChevronRight size={10} />
          <Link to="/library" className="hover:text-purple-300 transition">Library</Link>
          <FaChevronRight size={10} />
          <span className="text-slate-200 line-clamp-1">{book.title}</span>
        </div>

        {/* Main Grid */}
        <div className="grid gap-10 md:grid-cols-3 items-start">
          
          {/* Left Column: 3D Book Cover & Primary Actions */}
          <div className="animate-detail-item flex flex-col items-center gap-6">
            <div className="book-container-3d py-6 w-full flex justify-center bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="book-3d book-3d-large">
                <div className="book-3d-front">
                  {imageError || !coverImage ? (
                    <div className="w-full h-full bg-slate-800 text-slate-400 flex flex-col items-center justify-center">
                      <FaBook className="text-6xl mb-2 text-slate-600" />
                      <span>No Cover</span>
                    </div>
                  ) : (
                    <img 
                      src={coverImage} 
                      alt={book.title} 
                      className="h-full w-full object-cover" 
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
                <div className="book-3d-spine"></div>
                <div className="book-3d-pages"></div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="glass-card-premium w-full rounded-2xl p-6 space-y-4">
              <Link 
                to={`/read/${book._id}`} 
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-center flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20 hover:scale-[1.01] transition duration-300"
              >
                <FaBookOpen size={16} />
                Open Book Reader
              </Link>

              {book.pdf && (
                <button 
                  onClick={handleDownload}
                  className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-center flex items-center justify-center gap-2 transition duration-300"
                >
                  <FaDownload size={14} />
                  Download PDF
                </button>
              )}

              {/* Progress tracker */}
              {user && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm font-medium text-slate-200 mb-2">My Reading Progress</p>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={progress} 
                      onChange={(e) => setProgress(e.target.value)}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500" 
                    />
                    <span className="text-sm font-semibold text-violet-300 shrink-0">{progress}%</span>
                  </div>
                  <button 
                    onClick={updateProgress} 
                    className="mt-3 w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition"
                  >
                    Save Progress
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Book Details & Discussion */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Header info */}
            <div className="animate-detail-item glass-card-premium rounded-2xl p-6">
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">{book.title}</h1>
              <p className="text-violet-300 text-lg mt-1 font-medium">by {book.author}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                  <FaStar size={12} />
                  {book.averageRating?.toFixed(1) || 0}
                </span>
                <span>•</span>
                <span>{book.pages} pages</span>
                <span>•</span>
                <span>Language: {book.language}</span>
                {book.publishedYear && (
                  <>
                    <span>•</span>
                    <span>Published: {book.publishedYear}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {book.categories?.map((cat) => (
                  <span 
                    key={cat} 
                    className="bg-violet-500/15 border border-violet-500/20 text-violet-200 text-xs px-3 py-1 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-slate-300 leading-relaxed text-sm">{book.description}</p>
              </div>
            </div>

            {/* Moderation reporting */}
            {user && (
              <div className="animate-detail-item glass-card-premium rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FaFlag className="text-rose-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Content Flagging</h4>
                    <p className="text-xs text-slate-300">Spam, copyright issues, or violation of guidelines?</p>
                  </div>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                  <input
                    className="glass-input-premium rounded-lg px-3 py-1.5 text-xs w-full md:w-60 focus:outline-none"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Enter reason..."
                  />
                  <button 
                    className="rounded-lg bg-rose-600/35 hover:bg-rose-600 text-white text-xs px-4 py-2 border border-rose-500/30 transition shrink-0" 
                    onClick={reportBook}
                  >
                    Report
                  </button>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="animate-detail-item glass-card-premium rounded-2xl p-6">
              <h2 className="text-2xl font-bold font-display text-white mb-6">Reader Reviews</h2>

              {/* Review submit form */}
              {user ? (
                <form onSubmit={submitReview} className="mb-8 space-y-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-200 font-medium">My Rating:</label>
                    <select 
                      value={form.rating} 
                      onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))} 
                      className="glass-input-premium rounded px-2 py-1 text-sm focus:outline-none"
                    >
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n} className="bg-slate-900 text-white">{n} Stars</option>)}
                    </select>
                  </div>
                  <textarea 
                    value={form.comment} 
                    onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))} 
                    className="w-full glass-input-premium rounded-xl p-3 text-sm h-24 focus:outline-none" 
                    placeholder="Share your thoughts on the characters, plot, or style..." 
                  />
                  <button className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-semibold text-white transition">
                    Submit Review
                  </button>
                </form>
              ) : (
                <p className="text-sm text-slate-400 mb-6 italic">Please log in to submit a book review.</p>
              )}

              {/* Reviews Listing */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No reviews yet. Be the first to review this book!</p>
                ) : (
                  reviews.map((r) => {
                    const isOwnReview = user && r.user && (String(r.user._id) === String(user._id));
                    return (
                      <article key={r._id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-white">{r.user?.name || "Reader"}</p>
                            {isOwnReview && !editingReviewId && (
                              <button
                                onClick={() => {
                                  setEditingReviewId(r._id);
                                  setEditForm({ rating: r.rating, comment: r.comment });
                                }}
                                className="text-[10px] text-violet-400 hover:text-violet-200 transition font-semibold hover:underline cursor-pointer"
                              >
                                (Edit Review)
                              </button>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                            <FaStar size={10} />
                            {r.rating}/5
                          </span>
                        </div>
                        {editingReviewId === r._id ? (
                          <form onSubmit={handleUpdateReview} className="mt-2 mb-4 space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <label className="text-xs text-slate-200 font-medium">My Rating:</label>
                              <select 
                                value={editForm.rating} 
                                onChange={(e) => setEditForm((p) => ({ ...p, rating: Number(e.target.value) }))} 
                                className="glass-input-premium rounded px-2 py-1 text-xs focus:outline-none"
                              >
                                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n} className="bg-slate-900 text-white">{n} Stars</option>)}
                              </select>
                            </div>
                            <textarea 
                              value={editForm.comment} 
                              onChange={(e) => setEditForm((p) => ({ ...p, comment: e.target.value }))} 
                              className="w-full glass-input-premium rounded-xl p-3 text-xs h-20 focus:outline-none" 
                              placeholder="Update your review..." 
                            />
                            <div className="flex gap-2">
                              <button type="submit" className="rounded-lg bg-violet-600 hover:bg-violet-700 px-3 py-1.5 text-[10px] font-semibold text-white transition">
                                Save
                              </button>
                              <button type="button" onClick={() => setEditingReviewId(null)} className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-[10px] font-semibold text-white transition">
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="text-slate-300 text-sm">{r.comment}</p>
                        )}

                        {/* Comments / Replies */}
                        <div className="mt-4 ml-4 pl-4 border-l border-white/10 space-y-3">
                          {(threadMap[r._id] || []).map((c) => (
                            <div key={c._id} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 text-xs">
                              <p className="font-semibold text-violet-300 mb-0.5">{c.user?.name}</p>
                              <p className="text-slate-300">{c.comment}</p>
                            </div>
                          ))}

                          {/* Reply Form */}
                          {user && (
                            <div className="flex gap-2 items-center mt-2">
                              <input
                                className="w-full glass-input-premium rounded-lg p-2 text-xs focus:outline-none"
                                placeholder="Write a reply..."
                                value={commentInput[`${r._id}:root`] || ""}
                                onChange={(e) => setCommentInput((p) => ({ ...p, [`${r._id}:root`]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter") submitComment(r._id); }}
                              />
                              <button 
                                className="rounded-lg bg-violet-600/30 border border-violet-500/30 hover:bg-violet-600 px-3 py-2 text-xs text-white transition flex items-center gap-1 shrink-0" 
                                onClick={() => submitComment(r._id)}
                              >
                                <FaReply size={10} />
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="animate-detail-item glass-card-premium rounded-2xl p-6">
              <h2 className="text-2xl font-bold font-display text-white mb-4">Recommended For You</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {recommendations.slice(0, 3).map((item) => (
                  <Link to={`/books/${item._id}`} key={item._id} className="block group">
                    <div className="h-full bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/10">
                      <h4 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-purple-300 transition">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">by {item.author}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </GlassPage>
  );
}
