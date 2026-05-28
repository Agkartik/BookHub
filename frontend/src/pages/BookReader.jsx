import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  getBook, saveProgress, addReview,
  getHighlights, createHighlight, updateHighlight, deleteHighlight,
  chatWithBook, sendReadingHeartbeat, getMusic, uploadMusic, deleteMusic
} from "../services/bookService";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { 
  FaArrowLeft, FaCog, FaPlay, FaPause, FaStop, FaBookmark, 
  FaBookOpen, FaColumns, FaFilePdf, FaStickyNote, FaVolumeUp, FaMinus, FaPlus, FaStar,
  FaBrain, FaForward, FaBackward, FaTrash, FaPaperPlane, FaTimes, FaMusic, FaRandom, FaRedo
} from "react-icons/fa";
import { applyMoodTheme } from "../utils/moodThemes";
import { toAssetUrl } from "../services/api";

export default function BookReader() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  // Reader preferences
  const [readerTheme, setReaderTheme] = useState("sepia"); // sepia, light, night
  const [readerFont, setReaderFont] = useState("serif"); // serif, sans, mono
  const [fontSize, setFontSize] = useState(18); // px
  const [layoutMode, setLayoutMode] = useState("flowing"); // flowing, flip
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Text to Speech states (Phase 4 Audiobook tracking)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsRate, setTtsRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const sentencesRef = useRef([]);

  // Scroll tracking for progress
  const contentContainerRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  // Highlights & Annotations (Phase 1)
  const [highlights, setHighlights] = useState([]);
  const [selectionData, setSelectionData] = useState(null);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [highlightColor, setHighlightColor] = useState("yellow");
  const [highlightComment, setHighlightComment] = useState("");

  // AI Companion (Phase 2)
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello! I am your spoiler-free AI Book Companion. Ask me anything about this chapter — I promise no future spoilers! 📖" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Network Detection (Phase 5)
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Ambient Music Player state
  const [showMusic, setShowMusic] = useState(false);
  const [musicTracks, setMusicTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [musicLoop, setMusicLoop] = useState(true);
  const [musicShuffle, setMusicShuffle] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const audioRef = useRef(null);

  // Inline upload state in reader
  const [showMusicUpload, setShowMusicUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("custom");
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const musicFileInputRef = useRef(null);

  // Fetch book and notes
  useEffect(() => {
    getBook(id)
      .then((data) => {
        setBook(data);
        applyMoodTheme(data.moods, data.categories);
        setLoading(false);
        // Load saved notes for this book
        const savedNotes = localStorage.getItem(`book_notes_${id}`);
        if (savedNotes) setNotes(savedNotes);

        // Auto-play book-specific curated music track if present
        if (data.musicTrack) {
          setCurrentTrack(data.musicTrack);
          setIsMusicPlaying(true);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = toAssetUrl(data.musicTrack.url);
              audioRef.current.loop = true;
              audioRef.current.play().catch(() => {
                console.log("Autoplay blocked by browser policy. User action required.");
              });
            }
          }, 800);
        }
      })
      .catch(() => {
        toast.error("Failed to load book for reading");
        navigate(`/books/${id}`);
      });

    return () => {
      document.documentElement.classList.remove("mood-thrill", "mood-nature", "mood-dreamy", "mood-mystery", "mood-calm");
    };
  }, [id, navigate]);

  // Load voices for Speech Synthesis
  useEffect(() => {
    if (!synthRef.current) return;
    const updateVoices = () => {
      const allVoices = synthRef.current.getVoices();
      setVoices(allVoices);
      const defaultVoice = allVoices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB")) || allVoices[0];
      if (defaultVoice) setSelectedVoice(defaultVoice.name);
    };
    updateVoices();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = updateVoices;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Network listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info("Back online!");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline. Offline cache active.");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch highlights
  const loadHighlights = () => {
    if (!id) return;
    getHighlights(id, { chapterIndex: currentChapterIndex })
      .then(setHighlights)
      .catch(() => {});
  };

  useEffect(() => {
    loadHighlights();
  }, [id, currentChapterIndex]);

  // Reading Heartbeat (Phase 3)
  useEffect(() => {
    if (!book) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendReadingHeartbeat().catch(() => {});
      }
    }, 60000); // 1 minute interval
    return () => clearInterval(interval);
  }, [book]);

  // Split chapter into sentences for precision TTS controls
  const getChapterSentences = () => {
    if (!book) return [];
    const hasChapters = book.chapters && book.chapters.length > 0;
    const currentChapter = hasChapters ? book.chapters[currentChapterIndex] : null;
    if (!currentChapter) return [book.description || "No content available."];
    const text = `${currentChapter.title}. ${currentChapter.content}`;
    return text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  };

  useEffect(() => {
    sentencesRef.current = getChapterSentences();
    setCurrentSentenceIndex(0);
    stopSpeech();
  }, [currentChapterIndex, book]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, showAIChat]);

  // Load ambient music tracks
  useEffect(() => {
    if (!book) return;
    if (book.musicTrack) {
      setMusicTracks([book.musicTrack]);
    } else {
      getMusic({ bookId: book._id })
        .then(setMusicTracks)
        .catch(() => setMusicTracks([]));
    }
  }, [book]);

  // Sync audio volume and loop
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = musicVolume;
    audioRef.current.loop = musicLoop;
  }, [musicVolume, musicLoop]);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playTrack = (track) => {
    if (!audioRef.current) return;
    const url = toAssetUrl(track.url);
    if (currentTrack?._id === track._id && isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      return;
    }
    audioRef.current.src = url;
    audioRef.current.volume = musicVolume;
    audioRef.current.loop = musicLoop;
    audioRef.current.play()
      .then(() => {
        setCurrentTrack(track);
        setIsMusicPlaying(true);
      })
      .catch(() => toast.error("Could not play track. Try a different format."));
  };

  const toggleMusicPlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {});
    }
  };

  const handleMusicTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setMusicProgress(pct);
  };

  const handleMusicEnded = () => {
    if (musicShuffle && musicTracks.length > 1) {
      const others = musicTracks.filter(t => t._id !== currentTrack?._id);
      const next = others[Math.floor(Math.random() * others.length)];
      playTrack(next);
    } else if (!musicLoop) {
      setIsMusicPlaying(false);
      setMusicProgress(0);
    }
  };

  const handleMusicSeek = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const pct = Number(e.target.value);
    audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
    setMusicProgress(pct);
  };

  const toggleMusic = () => {
    setShowMusic(!showMusic);
    if (!showMusic) {
      setShowNotes(false);
      setShowAIChat(false);
    }
  };

  const getCategoryIcon = (cat) => {
    const icons = { calm: "🌊", focus: "🎯", ambient: "🌿", custom: "🎵", writer_curated: "✍️" };
    return icons[cat] || "🎵";
  };

  const getCategoryColor = (cat) => {
    const colors = {
      calm: "from-sky-500/20 to-blue-500/20 border-sky-500/20 text-sky-300",
      focus: "from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-300",
      ambient: "from-emerald-500/20 to-green-500/20 border-emerald-500/20 text-emerald-300",
      custom: "from-violet-500/20 to-purple-500/20 border-violet-500/20 text-violet-300",
      writer_curated: "from-rose-500/20 to-pink-500/20 border-rose-500/20 text-rose-300"
    };
    return colors[cat] || "from-slate-500/20 to-slate-500/20 border-slate-500/20 text-slate-300";
  };

  // Reload ambient music tracks
  const reloadMusicTracks = () => {
    if (!book) return;
    if (book.musicTrack) {
      setMusicTracks([book.musicTrack]);
    } else {
      getMusic({ bookId: book._id })
        .then(setMusicTracks)
        .catch(() => setMusicTracks([]));
    }
  };

  // Inline upload from within the reader drawer
  const handleInlineUploadMusic = async (e) => {
    e.preventDefault();
    if (!uploadFile) { toast.error("Please choose an audio file."); return; }
    if (!uploadTitle.trim()) { toast.error("Please enter a track title."); return; }

    // Reader hard limit: 3 custom tracks
    const myCustomCount = musicTracks.filter(
      t => t.uploadedBy === user?._id || t.uploadedBy?._id === user?._id
    ).length;
    if (user?.role === "user" && myCustomCount >= 3) {
      toast.error("You've reached the 3 track limit. Delete a track first.");
      return;
    }

    const fd = new FormData();
    fd.append("audioFile", uploadFile);
    fd.append("title", uploadTitle.trim());
    fd.append("category", uploadCategory);

    setIsUploadingMusic(true);
    try {
      await uploadMusic(fd);
      toast.success("Track uploaded! 🎵");
      setUploadTitle("");
      setUploadCategory("custom");
      setUploadFile(null);
      setShowMusicUpload(false);
      if (musicFileInputRef.current) musicFileInputRef.current.value = "";
      reloadMusicTracks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setIsUploadingMusic(false);
    }
  };

  // Delete a track from the drawer
  const handleDeleteMusicTrack = async (trackId) => {
    if (!window.confirm("Remove this track from your library?")) return;
    try {
      await deleteMusic(trackId);
      toast.success("Track removed.");
      if (currentTrack?._id === trackId) {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
        setCurrentTrack(null);
        setIsMusicPlaying(false);
      }
      reloadMusicTracks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete track.");
    }
  };

  // Sync notes to localStorage
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem(`book_notes_${id}`, e.target.value);
  };

  // Text-To-Speech Functions (Sentence level)
  const speakCurrentSentence = (index) => {
    if (!synthRef.current || sentencesRef.current.length === 0) return;
    synthRef.current.cancel();

    const sentence = sentencesRef.current[index];
    if (!sentence) {
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence);
    if (selectedVoice) {
      const voiceObj = voices.find(v => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }
    utterance.rate = ttsRate;

    utterance.onend = () => {
      const nextIndex = index + 1;
      if (nextIndex < sentencesRef.current.length) {
        setCurrentSentenceIndex(nextIndex);
        speakCurrentSentence(nextIndex);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const startSpeech = () => {
    speakCurrentSentence(currentSentenceIndex);
  };

  const pauseSpeech = () => {
    if (!synthRef.current) return;
    if (isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    } else if (isSpeaking && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopSpeech = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const skipBackward = () => {
    const newIndex = Math.max(0, currentSentenceIndex - 2);
    setCurrentSentenceIndex(newIndex);
    if (isSpeaking) {
      speakCurrentSentence(newIndex);
    }
  };

  const skipForward = () => {
    const newIndex = Math.min(sentencesRef.current.length - 1, currentSentenceIndex + 2);
    setCurrentSentenceIndex(newIndex);
    if (isSpeaking) {
      speakCurrentSentence(newIndex);
    }
  };

  // Progress Persister
  const saveReadingProgress = async (percent) => {
    const now = Date.now();
    if (now - lastSavedTimeRef.current < 3000 && percent < 100) return; // throttle unless 100% finished
    lastSavedTimeRef.current = now;
    try {
      await saveProgress(id, {
        progressPercent: Math.round(percent),
        lastPage: currentChapterIndex + 1
      });
    } catch {
      // Background fail silent
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error("Please enter a comment for your review");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await addReview(id, { rating: reviewRating, comment: reviewComment });
      await saveReadingProgress(100);
      toast.success("Review submitted! Reading progress marked as 100% completed.");
      setShowReviewModal(false);
      navigate(`/books/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderReviewModal = () => {
    if (!showReviewModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0f28]/95 backdrop-blur-xl shadow-2xl p-6 md:p-8 text-white">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <span>🎉</span> Congratulations!
          </h3>
          <p className="text-slate-300 text-sm mb-6">
            You have finished reading <strong className="text-white">"{book.title}"</strong>. Share your experience with the community by writing a review.
          </p>

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">My Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setReviewRating(stars)}
                    className="p-1 hover:scale-110 transition duration-150 cursor-pointer"
                  >
                    <FaStar 
                      size={24} 
                      className={stars <= reviewRating ? "text-amber-400" : "text-slate-600"} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2 block">Comment</label>
              <textarea
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What did you think of the story, characters, and style?"
                className="w-full glass-input-premium rounded-xl p-3 text-sm h-32 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none text-white bg-white/5 border border-white/10"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="flex-grow py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition duration-300 cursor-pointer"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition duration-300 border border-white/10 cursor-pointer"
              >
                Skip
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Selection detection for highlight popover
  const handleSelection = () => {
    const sel = window.getSelection();
    const text = sel.toString().trim();
    if (!text) {
      setSelectionData(null);
      return;
    }

    let parent = sel.anchorNode;
    while (parent && parent.nodeName !== "P") {
      parent = parent.parentNode;
    }

    if (parent && parent.hasAttribute("data-para-index")) {
      const paraIndex = parseInt(parent.getAttribute("data-para-index"), 10);
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionData({
        text,
        paraIndex,
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 10
      });
    }
  };

  const handleSaveHighlight = async () => {
    if (!selectionData) return;
    try {
      const hl = await createHighlight(id, {
        chapterIndex: currentChapterIndex,
        paraIndex: selectionData.paraIndex,
        text: selectionData.text,
        color: highlightColor,
        comment: highlightComment
      });
      toast.success("Highlight saved");
      setHighlights(prev => [...prev, hl]);
      setSelectionData(null);
      setHighlightComment("");
    } catch {
      toast.error("Failed to save highlight");
    }
  };

  const handleUpdateHighlight = async () => {
    if (!selectedHighlight) return;
    try {
      const updated = await updateHighlight(selectedHighlight._id, {
        color: selectedHighlight.color,
        comment: selectedHighlight.comment
      });
      toast.success("Highlight updated");
      setHighlights(prev => prev.map(h => h._id === updated._id ? updated : h));
      setSelectedHighlight(null);
    } catch {
      toast.error("Failed to update highlight");
    }
  };

  const handleDeleteHighlight = async () => {
    if (!selectedHighlight) return;
    try {
      await deleteHighlight(selectedHighlight._id);
      toast.success("Highlight deleted");
      setHighlights(prev => prev.filter(h => h._id !== selectedHighlight._id));
      setSelectedHighlight(null);
    } catch {
      toast.error("Failed to delete highlight");
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setIsSendingChat(true);

    try {
      const res = await chatWithBook(id, {
        question: userText,
        chapterIndex: currentChapterIndex
      });
      setChatMessages(prev => [...prev, { sender: "ai", text: res.answer }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: "ai", text: "Sorry, I couldn't connect to my knowledge base right now. Please try again!" }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Helper to render paragraph segments with inline colored marks
  const renderParagraph = (paraText, pIdx) => {
    const paraHighlights = highlights.filter(h => h.paraIndex === pIdx);
    if (paraHighlights.length === 0) return paraText;

    let parts = [{ text: paraText, isHighlight: false }];

    for (const hl of paraHighlights) {
      const newParts = [];
      for (const part of parts) {
        if (part.isHighlight) {
          newParts.push(part);
          continue;
        }
        const index = part.text.indexOf(hl.text);
        if (index !== -1) {
          const before = part.text.substring(0, index);
          const match = part.text.substring(index, index + hl.text.length);
          const after = part.text.substring(index + hl.text.length);
          if (before) newParts.push({ text: before, isHighlight: false });
          newParts.push({ text: match, isHighlight: true, highlight: hl });
          if (after) newParts.push({ text: after, isHighlight: false });
        } else {
          newParts.push(part);
        }
      }
      parts = newParts;
    }

    return parts.map((part, index) => {
      if (part.isHighlight) {
        const colors = {
          yellow: "bg-yellow-400/40 border-b border-yellow-500 text-white cursor-pointer hover:bg-yellow-400/60",
          violet: "bg-violet-400/40 border-b border-violet-500 text-white cursor-pointer hover:bg-violet-400/60",
          cyan: "bg-cyan-400/40 border-b border-cyan-500 text-white cursor-pointer hover:bg-cyan-400/60",
          rose: "bg-rose-400/40 border-b border-rose-500 text-white cursor-pointer hover:bg-rose-400/60"
        };
        return (
          <span
            key={index}
            className={`${colors[part.highlight.color]} px-0.5 rounded transition`}
            title={part.highlight.comment || "Click to edit annotation"}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedHighlight(part.highlight);
            }}
          >
            {part.text}
            {part.highlight.comment && (
              <span className="ml-0.5 text-[10px] opacity-75">💬</span>
            )}
          </span>
        );
      }
      return part.text;
    });
  };

  // Trigger progress updates on scroll or chapter switch
  const handleScroll = () => {
    if (layoutMode !== "flowing" || !contentContainerRef.current) return;
    const element = contentContainerRef.current;
    const totalHeight = element.scrollHeight - element.clientHeight;
    if (totalHeight <= 0) return;
    const scrolled = (element.scrollTop / totalHeight) * 100;
    
    if (book && book.chapters?.length > 0) {
      const chapterWeight = 100 / book.chapters.length;
      const basePercent = currentChapterIndex * chapterWeight;
      const currentChapterProgress = (scrolled / 100) * chapterWeight;
      saveReadingProgress(basePercent + currentChapterProgress);
    }
  };

  const changeChapter = (index) => {
    if (!book || !book.chapters) return;
    if (index < 0 || index >= book.chapters.length) return;
    
    stopSpeech();
    setCurrentChapterIndex(index);
    
    const percent = (index / book.chapters.length) * 100;
    saveReadingProgress(percent);

    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTop = 0;
    }
  };

  const toggleNotes = () => {
    setShowNotes(!showNotes);
    if (!showNotes) setShowAIChat(false);
  };

  const toggleAIChat = () => {
    setShowAIChat(!showAIChat);
    if (!showAIChat) setShowNotes(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#07070f] text-white">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-violet-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-300 font-medium">Preparing your reading desk...</p>
        </div>
      </div>
    );
  }

  // PDF Viewer Viewport
  if (book.pdf) {
    return (
      <div className="flex flex-col h-screen bg-[#07070f] text-white">
        {/* Header Toolbar */}
        <header className="flex justify-between items-center px-6 py-4 bg-indigo-950/70 backdrop-blur border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <Link to={`/books/${id}`} className="p-2 hover:bg-white/10 rounded-lg transition text-slate-300 hover:text-white">
              <FaArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-base font-bold line-clamp-1">{book.title}</h1>
              <p className="text-xs text-slate-400">by {book.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition duration-300 cursor-pointer"
            >
              Finish & Review ✨
            </button>
            <span className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-1 rounded-lg text-xs font-semibold">
              <FaFilePdf size={12} />
              PDF Mode
            </span>
          </div>
        </header>

        {/* PDF Frame */}
        <div className="flex-grow flex relative">
          <iframe 
            src={toAssetUrl(book.pdf)} 
            className="w-full h-full border-0" 
            title={book.title}
          />
        </div>
        {renderReviewModal()}
      </div>
    );
  }

  const hasChapters = book.chapters && book.chapters.length > 0;
  const currentChapter = hasChapters ? book.chapters[currentChapterIndex] : {
    title: "Introduction",
    content: book.description || "No content available."
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${
      readerTheme === "sepia" ? "reader-theme-sepia" : 
      readerTheme === "night" ? "reader-theme-night" : "reader-theme-light"
    }`}>
      
      {/* Top Navigation & Settings Bar */}
      <header className="flex flex-col md:flex-row justify-between items-center px-6 py-4 reader-header-mood text-white shrink-0 gap-4 md:gap-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link to={`/books/${id}`} className="p-2 hover:bg-white/10 rounded-lg transition text-slate-300 hover:text-white">
            <FaArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm md:text-base font-bold line-clamp-1">{book.title}</h1>
            <p className="text-xs text-violet-300">by {book.author}</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* TTS Panel */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs">
            <FaVolumeUp className="text-violet-300 mx-1" />
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded text-white text-[10px] py-1 max-w-[120px] focus:outline-none"
            >
              {voices.map(v => (
                <option key={v.name} value={v.name}>{v.name.substring(0, 15)}...</option>
              ))}
            </select>
            <div className="flex items-center gap-1 shrink-0 border-l border-white/10 pl-1.5">
              {!isSpeaking ? (
                <button onClick={startSpeech} className="p-1 hover:bg-white/10 rounded text-emerald-400" title="Read Aloud">
                  <FaPlay size={10} />
                </button>
              ) : (
                <>
                  <button onClick={pauseSpeech} className="p-1 hover:bg-white/10 rounded text-amber-400" title={isPaused ? "Resume" : "Pause"}>
                    {isPaused ? <FaPlay size={10} /> : <FaPause size={10} />}
                  </button>
                  <button onClick={stopSpeech} className="p-1 hover:bg-white/10 rounded text-rose-400" title="Stop">
                    <FaStop size={10} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Reading Preferences */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle chips */}
            <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5">
              {["sepia", "light", "night"].map(theme => (
                <button
                  key={theme}
                  onClick={() => setReaderTheme(theme)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded capitalize transition ${
                    readerTheme === theme ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            {/* Layout Toggles */}
            <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5">
              <button
                onClick={() => setLayoutMode("flowing")}
                className={`p-1.5 rounded transition ${layoutMode === "flowing" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="Continuous Flowing View"
              >
                <FaBookOpen size={11} />
              </button>
              <button
                onClick={() => setLayoutMode("flip")}
                className={`p-1.5 rounded transition ${layoutMode === "flip" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="Dual Page-Flip View"
              >
                <FaColumns size={11} />
              </button>
            </div>

            {/* Typography Dropdown */}
            <div className="relative group">
              <button className="p-2 hover:bg-white/10 rounded-lg transition text-slate-300 hover:text-white" title="Text Styles">
                <FaCog size={14} />
              </button>
              <div className="absolute right-0 top-10 w-48 bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl z-50 hidden group-focus-within:block group-hover:block space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Font Face</label>
                  <div className="grid grid-cols-3 gap-1">
                    {["serif", "sans", "mono"].map(font => (
                      <button
                        key={font}
                        onClick={() => setReaderFont(font)}
                        className={`text-[10px] py-1 border rounded transition border-white/10 ${
                          readerFont === font ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Font Size</label>
                  <div className="flex items-center justify-between gap-2">
                    <button 
                      onClick={() => setFontSize(p => Math.max(12, p - 2))}
                      className="p-1 text-xs border border-white/10 rounded hover:bg-white/5 text-white w-8"
                    >
                      <FaMinus size={8} className="mx-auto" />
                    </button>
                    <span className="text-xs text-white font-bold">{fontSize}px</span>
                    <button 
                      onClick={() => setFontSize(p => Math.min(32, p + 2))}
                      className="p-1 text-xs border border-white/10 rounded hover:bg-white/5 text-white w-8"
                    >
                      <FaPlus size={8} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Companion Companion button */}
            <button 
              onClick={toggleAIChat}
              className={`p-2 hover:bg-white/10 rounded-lg transition ${showAIChat ? "text-violet-300 bg-white/5" : "text-slate-300 hover:text-white"}`}
              title="AI Book Companion"
            >
              <FaBrain size={14} />
            </button>

            {/* Notes Toggle */}
            <button 
              onClick={toggleNotes}
              className={`p-2 hover:bg-white/10 rounded-lg transition ${showNotes ? "text-violet-300 bg-white/5" : "text-slate-300 hover:text-white"}`}
              title="Toggle Notebook Drawer"
            >
              <FaStickyNote size={14} />
            </button>

            {/* Ambient Music Toggle */}
            <button 
              onClick={toggleMusic}
              className={`p-2 hover:bg-white/10 rounded-lg transition relative ${showMusic ? "text-emerald-300 bg-white/5" : "text-slate-300 hover:text-white"}`}
              title="Ambient Music Player"
            >
              <FaMusic size={14} />
              {isMusicPlaying && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

          </div>
        </div>
      </header>

      {/* Hidden Audio Element for Music */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleMusicTimeUpdate}
        onEnded={handleMusicEnded}
        style={{ display: "none" }}
      />

      {/* Main Body */}
      <div className="flex-grow flex overflow-hidden relative">
        
        {/* Chapters Navigation Drawer (Left Panel) */}
        {hasChapters && (
          <aside className="w-60 reader-sidebar-mood text-white overflow-y-auto shrink-0 hidden md:block">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-xs font-bold text-violet-300 uppercase tracking-wider">Chapters</h2>
            </div>
            <nav className="p-2 space-y-1">
              {book.chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => changeChapter(idx)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition line-clamp-2 ${
                    currentChapterIndex === idx 
                      ? "reader-chapter-active font-semibold shadow-md" 
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Ambient Music Drawer */}
        {showMusic && (
          <aside
            style={{ animation: "slideInRight 0.3s ease" }}
            className="w-80 bg-[#0b0d22]/95 backdrop-blur-xl border-l border-white/10 text-white shrink-0 flex flex-col overflow-hidden"
          >
            {/* ── Drawer Header ── */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FaMusic className="text-emerald-400" /> Ambient Music
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Focus · Calm · Immerse</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Upload button — only when book has NO curated track */}
                {!book.musicTrack && (
                  <button
                    onClick={() => setShowMusicUpload(v => !v)}
                    className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                      showMusicUpload
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "hover:bg-white/10 text-slate-400 hover:text-white"
                    }`}
                    title="Add your track"
                  >
                    <FaPlus size={11} />
                  </button>
                )}
                <button onClick={() => setShowMusic(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
                  <FaTimes size={12} />
                </button>
              </div>
            </div>

            {/* ── Curated Theme Notice ── */}
            {book.musicTrack && (
              <div className="mx-4 mt-3 p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-[10px] text-center font-semibold">
                ✍️ Writer's Curated Theme — track locked
              </div>
            )}

            {/* ── Reader slot indicator (when no curated track) ── */}
            {!book.musicTrack && user?.role === "user" && (
              <div className="px-5 pt-3 shrink-0">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Your slots</span>
                  <span className={`font-bold ${
                    musicTracks.filter(t => (t.uploadedBy?._id || t.uploadedBy) === user?._id).length >= 3
                      ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {musicTracks.filter(t => (t.uploadedBy?._id || t.uploadedBy) === user?._id).length}/3
                  </span>
                </div>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${
                      i < musicTracks.filter(t => (t.uploadedBy?._id || t.uploadedBy) === user?._id).length
                        ? "bg-emerald-500" : "bg-white/10"
                    }`} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Inline Upload Form ── */}
            {!book.musicTrack && showMusicUpload && (
              <form onSubmit={handleInlineUploadMusic} className="mx-4 mt-3 p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl space-y-2.5 shrink-0">
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Upload Track</p>

                <input
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="Track title…"
                  className="w-full rounded-lg px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                  required
                />

                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="w-full rounded-lg px-3 py-1.5 text-xs bg-slate-900 border border-white/10 text-white focus:outline-none"
                >
                  <option value="calm">🌊 Calm</option>
                  <option value="focus">🎯 Focus</option>
                  <option value="ambient">🌿 Ambient</option>
                  <option value="custom">🎵 Custom</option>
                  {(user?.role === "writer" || user?.role === "admin") && (
                    <option value="writer_curated">✍️ Writer Curated</option>
                  )}
                </select>

                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-white/15 bg-white/3 hover:bg-white/6 px-3 py-2 transition">
                  <FaMusic className="text-slate-400 shrink-0" size={11} />
                  <span className="text-[10px] text-slate-300 truncate flex-1">
                    {uploadFile ? uploadFile.name : "Choose audio file (MP3/WAV/OGG)…"}
                  </span>
                  <input
                    ref={musicFileInputRef}
                    type="file"
                    accept=".mp3,.wav,.ogg,.m4a,audio/*"
                    className="hidden"
                    onChange={e => setUploadFile(e.target.files[0] || null)}
                    required
                  />
                </label>

                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowMusicUpload(false)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 bg-white/5 hover:bg-white/10 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingMusic}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingMusic ? "Uploading…" : "Upload"}
                  </button>
                </div>
              </form>
            )}

            {/* ── Now Playing Bar ── */}
            {currentTrack && (
              <div className="mx-4 mt-3 rounded-xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 p-3 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
                    <p className="text-[10px] text-emerald-300 truncate">
                      {getCategoryIcon(currentTrack.category)} {currentTrack.category?.replace("_", " ")}
                    </p>
                  </div>
                  <button
                    onClick={toggleMusicPlay}
                    className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition shrink-0 cursor-pointer"
                  >
                    {isMusicPlaying ? <FaPause size={10} /> : <FaPlay size={10} />}
                  </button>
                </div>
                <input type="range" min={0} max={100} step={0.5} value={musicProgress} onChange={handleMusicSeek} className="w-full h-1 accent-emerald-400 cursor-pointer" />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMusicShuffle(s => !s)} className={`p-1 rounded transition cursor-pointer ${musicShuffle ? "text-emerald-400" : "text-slate-500 hover:text-white"}`} title="Shuffle"><FaRandom size={10}/></button>
                    <button onClick={() => setMusicLoop(l => !l)} className={`p-1 rounded transition cursor-pointer ${musicLoop ? "text-emerald-400" : "text-slate-500 hover:text-white"}`} title="Loop"><FaRedo size={10}/></button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaVolumeUp size={9} className="text-slate-400" />
                    <input type="range" min={0} max={1} step={0.05} value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} className="w-14 h-1 accent-emerald-400 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Track List ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
              {musicTracks.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <FaMusic size={24} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs">No tracks yet.</p>
                  {!book.musicTrack && (
                    <button
                      onClick={() => setShowMusicUpload(true)}
                      className="mt-3 text-[10px] text-emerald-400 underline cursor-pointer"
                    >
                      Upload your first track ↑
                    </button>
                  )}
                </div>
              ) : (
                musicTracks.map(track => {
                  const isOwner = (track.uploadedBy?._id || track.uploadedBy) === user?._id;
                  const isPlaying = currentTrack?._id === track._id && isMusicPlaying;
                  return (
                    <div
                      key={track._id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition duration-200 ${
                        currentTrack?._id === track._id
                          ? "bg-emerald-500/10 border-emerald-500/25"
                          : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      }`}
                    >
                      <button
                        onClick={() => playTrack(track)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <span className="text-lg shrink-0">{getCategoryIcon(track.category)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                          <p className="text-[10px] text-slate-400 capitalize mt-0.5">{track.category?.replace("_", " ")}</p>
                        </div>
                        {isPlaying && (
                          <span className="flex gap-0.5 items-end h-3.5 shrink-0">
                            {[60,100,75].map((h,i) => (
                              <span key={i} className="w-0.5 bg-emerald-400 rounded-full animate-bounce" style={{height:`${h}%`, animationDelay:`${i*0.15}s`}} />
                            ))}
                          </span>
                        )}
                      </button>
                      {/* Delete button only for track owner or admin */}
                      {(isOwner || user?.role === "admin") && !book.musicTrack && (
                        <button
                          onClick={() => handleDeleteMusicTrack(track._id)}
                          className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer shrink-0"
                          title="Delete track"
                        >
                          <FaTrash size={10} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* Reader Core Content Viewport */}
        <main 
          ref={contentContainerRef}
          onScroll={handleScroll}
          onMouseUp={handleSelection}
          className="flex-grow overflow-y-auto px-6 py-10 md:px-16"
        >
          <div className="max-w-3xl mx-auto">
            {/* Header in Reader view */}
            <div className="border-b border-black/5 dark:border-white/5 pb-4 mb-8 text-center text-slate-800 dark:text-white">
              <p className="text-xs uppercase tracking-wider opacity-60 mb-1">
                {hasChapters ? `Chapter ${currentChapterIndex + 1} of ${book.chapters.length}` : "Book Preview"}
              </p>
              <h2 className="text-2xl font-bold font-display">{currentChapter.title}</h2>
            </div>

            {/* Content Rendering Layouts */}
            {layoutMode === "flowing" ? (
              <div 
                style={{ fontSize: `${fontSize}px` }}
                className={`reader-font-${readerFont} leading-relaxed select-text space-y-6 text-justify`}
              >
                {currentChapter.content.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx} data-para-index={pIdx}>
                    {renderParagraph(para, pIdx)}
                  </p>
                ))}
              </div>
            ) : (
              <div className="relative border border-black/5 dark:border-white/5 rounded-2xl bg-white/[0.01] shadow-2xl p-6 md:p-8 min-h-[500px]">
                <div className="reader-book-spine-crease"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div 
                    style={{ fontSize: `${fontSize - 1}px` }}
                    className={`reader-font-${readerFont} leading-relaxed space-y-4 reader-page-left text-justify`}
                  >
                    {currentChapter.content.split("\n\n").slice(0, Math.ceil(currentChapter.content.split("\n\n").length / 2)).map((para, pIdx) => (
                      <p key={pIdx} data-para-index={pIdx}>
                        {renderParagraph(para, pIdx)}
                      </p>
                    ))}
                  </div>

                  <div 
                    style={{ fontSize: `${fontSize - 1}px` }}
                    className={`reader-font-${readerFont} leading-relaxed space-y-4 reader-page-right text-justify`}
                  >
                    {currentChapter.content.split("\n\n").slice(Math.ceil(currentChapter.content.split("\n\n").length / 2)).map((para, pIdx) => (
                      <p key={pIdx} data-para-index={pIdx + Math.ceil(currentChapter.content.split("\n\n").length / 2)}>
                        {renderParagraph(para, pIdx + Math.ceil(currentChapter.content.split("\n\n").length / 2))}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Next/Prev Page Toggles */}
            {hasChapters && (
              <div className="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => changeChapter(currentChapterIndex - 1)}
                  disabled={currentChapterIndex === 0}
                  className="px-4 py-2 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-40 transition text-xs font-semibold flex items-center gap-1.5"
                >
                  &larr; Previous Chapter
                </button>
                {currentChapterIndex === book.chapters.length - 1 ? (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-900/20 cursor-pointer"
                  >
                    Finish & Review Book ✨
                  </button>
                ) : (
                  <button
                    onClick={() => changeChapter(currentChapterIndex + 1)}
                    className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    Next Chapter &rarr;
                  </button>
                )}
              </div>
            )}

          </div>
        </main>

        {/* Notebook Drawer (Right Panel) */}
        {showNotes && (
          <aside className="w-80 reader-sidebar-mood text-white p-4 flex flex-col shrink-0 absolute md:relative right-0 top-0 bottom-0 z-45 h-full">
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-bold text-violet-300 flex items-center gap-1.5">
                <FaStickyNote size={12} />
                Reading Journal
              </h3>
              <button 
                onClick={() => setShowNotes(false)} 
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <textarea
              className="flex-grow w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none text-white resize-none"
              placeholder="Jot down quotes, plot connections, reviews or character profiles..."
              value={notes}
              onChange={handleNotesChange}
            />
            <div className="mt-3 text-[10px] text-slate-400">
              * Journal saves automatically on every stroke.
            </div>
          </aside>
        )}

        {/* AI Book Companion Drawer (Right Panel) */}
        {showAIChat && (
          <aside className="w-80 reader-sidebar-mood text-white p-4 flex flex-col shrink-0 absolute md:relative right-0 top-0 bottom-0 z-45 h-full">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                <FaBrain size={14} />
                AI Companion
              </h3>
              <button 
                onClick={() => setShowAIChat(false)} 
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-xl max-w-[85%] ${
                    msg.sender === "user" 
                      ? "bg-violet-600 text-white ml-auto" 
                      : "bg-white/5 border border-white/5 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              ))}
              {isSendingChat && (
                <div className="bg-white/5 border border-white/5 p-3 rounded-xl max-w-[85%] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="mt-4 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask AI Companion..."
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="p-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl disabled:opacity-50 transition cursor-pointer"
              >
                <FaPaperPlane size={12} />
              </button>
            </form>
          </aside>
        )}

      </div>

      {/* Floating Selection Popover */}
      {selectionData && (
        <div 
          className="fixed z-50 bg-[#0d0f28]/95 border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col gap-2 text-white text-xs w-60 backdrop-blur-md"
          style={{ 
            top: `${selectionData.y - 120}px`,
            left: `${Math.min(window.innerWidth - 260, Math.max(10, selectionData.x - 120))}px`
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="font-semibold text-violet-300">Highlight Text</span>
            <button onClick={() => setSelectionData(null)} className="text-slate-400 hover:text-white">
              <FaTimes size={10} />
            </button>
          </div>
          
          <div className="flex gap-2">
            {["yellow", "violet", "cyan", "rose"].map(color => {
              const bg = {
                yellow: "bg-yellow-400",
                violet: "bg-violet-400",
                cyan: "bg-cyan-400",
                rose: "bg-rose-400"
              };
              return (
                <button
                  key={color}
                  onClick={() => setHighlightColor(color)}
                  className={`w-5 h-5 rounded-full ${bg[color]} border-2 ${
                    highlightColor === color ? "border-white" : "border-transparent"
                  } transition hover:scale-110 cursor-pointer`}
                />
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Add note..."
            value={highlightComment}
            onChange={e => setHighlightComment(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none"
          />

          <button
            onClick={handleSaveHighlight}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded py-1 font-semibold text-xs transition cursor-pointer"
          >
            Save Highlight
          </button>
        </div>
      )}

      {/* Edit Highlight Modal */}
      {selectedHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0f28]/95 backdrop-blur-xl shadow-2xl p-5 text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-semibold text-violet-300">Edit Annotation</h3>
              <button onClick={() => setSelectedHighlight(null)} className="text-slate-400 hover:text-white">
                <FaTimes size={14} />
              </button>
            </div>
            
            <p className="text-xs italic text-slate-300 border-l-2 border-violet-500 pl-2">
              "{selectedHighlight.text}"
            </p>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Highlight Color</label>
              <div className="flex gap-2">
                {["yellow", "violet", "cyan", "rose"].map(color => {
                  const bg = {
                    yellow: "bg-yellow-400",
                    violet: "bg-violet-400",
                    cyan: "bg-cyan-400",
                    rose: "bg-rose-400"
                  };
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedHighlight(prev => ({ ...prev, color }))}
                      className={`w-5 h-5 rounded-full ${bg[color]} border-2 ${
                        selectedHighlight.color === color ? "border-white" : "border-transparent"
                      } transition hover:scale-110 cursor-pointer`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Annotation Note</label>
              <textarea
                value={selectedHighlight.comment}
                onChange={e => setSelectedHighlight(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none h-20 resize-none"
                placeholder="Annotation text..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleUpdateHighlight}
                className="flex-grow py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Save Changes
              </button>
              <button
                onClick={handleDeleteHighlight}
                className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/20 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <FaTrash size={12} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spotify-styled Bottom TTS Audio Bar (Phase 4) */}
      {isSpeaking && (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl bg-[#0d0f28]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-40 text-white">
          {/* Meta & Visualizer */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
              <FaVolumeUp size={16} />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold line-clamp-1">{book.title}</h4>
              <p className="text-[10px] text-slate-400">Chapter {currentChapterIndex + 1} — Sentence {currentSentenceIndex + 1}/{sentencesRef.current.length}</p>
            </div>
            
            {/* Visualizer animation */}
            <div className="flex items-end gap-0.5 h-3 ml-2 shrink-0">
              <span className={`w-0.5 bg-violet-400 transition-all ${isPaused ? "h-1" : "h-3 animate-pulse"}`}></span>
              <span className={`w-0.5 bg-violet-400 transition-all ${isPaused ? "h-1" : "h-2.5 animate-pulse delay-75"}`}></span>
              <span className={`w-0.5 bg-violet-400 transition-all ${isPaused ? "h-1" : "h-3.5 animate-pulse delay-150"}`}></span>
              <span className={`w-0.5 bg-violet-400 transition-all ${isPaused ? "h-1" : "h-2 animate-pulse delay-200"}`}></span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={skipBackward} 
              className="p-2 hover:bg-white/5 rounded-full transition text-slate-400 hover:text-white"
              title="Skip backward"
            >
              <FaBackward size={14} />
            </button>

            <button 
              onClick={pauseSpeech} 
              className="p-3 bg-violet-600 hover:bg-violet-700 rounded-full transition text-white shadow-lg shadow-violet-900/30 hover:scale-105"
              title={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <FaPlay size={14} /> : <FaPause size={14} />}
            </button>

            <button 
              onClick={skipForward} 
              className="p-2 hover:bg-white/5 rounded-full transition text-slate-400 hover:text-white"
              title="Skip forward"
            >
              <FaForward size={14} />
            </button>

            <button 
              onClick={stopSpeech} 
              className="p-2 hover:bg-rose-500/10 rounded-full transition text-rose-400"
              title="Stop"
            >
              <FaStop size={12} />
            </button>
          </div>

          {/* Speed Selector & Network */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
            <select
              value={ttsRate}
              onChange={(e) => setTtsRate(Number(e.target.value))}
              className="bg-slate-900 border border-white/10 rounded-lg text-white text-[10px] py-1 px-2 focus:outline-none"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>

            {!isOnline && (
              <span className="flex items-center gap-1 text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                🔌 Offline
              </span>
            )}
          </div>
        </div>
      )}

      {renderReviewModal()}
    </div>
  );
}
