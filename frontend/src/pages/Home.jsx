import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  FaBookOpen,
  FaFeatherAlt,
  FaShieldAlt,
  FaStar,
  FaArrowRight,
  FaUsers,
  FaBook,
} from "react-icons/fa";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const showcaseBooks = [
  {
    title: "The Midnight Archive",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
    rotate: -14,
    left: "8%",
    top: 48,
    z: 1,
  },
  {
    title: "Quantum Rain",
    cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80",
    rotate: 0,
    left: "32%",
    top: 0,
    z: 3,
  },
  {
    title: "Designing With Calm",
    cover: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=400&q=80",
    rotate: 12,
    left: "54%",
    top: 64,
    z: 2,
  },
];

export default function Home() {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const features = [
    {
      title: "Reader + Writer Accounts",
      description: "Anyone can read. Writers publish manuscripts and grow a real audience.",
      icon: <FaFeatherAlt className="text-xl text-violet-400" />,
    },
    {
      title: "Community Reviews",
      description: "Rate books, join discussions, and discover what readers love most.",
      icon: <FaStar className="text-xl text-violet-400" />,
    },
    {
      title: "Secure by Design",
      description: "Role-based access, protected uploads, and verified accounts.",
      icon: <FaShieldAlt className="text-xl text-violet-400" />,
    },
  ];

  const stats = [
    { label: "Genres", value: "20+" },
    { label: "Readers", value: "10K+" },
    { label: "Writers", value: "500+" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-white">
      {/* Animated ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="glass-page-bg absolute inset-0" />
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,255,0.18),transparent)]" />
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative px-4 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-10">
          {/* Copy */}
          <motion.div style={{ y: textY }} className="text-center lg:text-left">
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-200"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              Next-gen reading platform
            </motion.span>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.4rem]"
            >
              Read. Publish.{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                Grow your story.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mx-auto mt-6 max-w-xl text-lg text-slate-400 lg:mx-0"
            >
              BookVerse connects readers and writers in one beautiful library — discover books,
              track progress, and publish your own work.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Link
                to="/library"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 font-semibold shadow-lg shadow-violet-900/40 transition hover:scale-[1.02] hover:shadow-violet-700/50"
              >
                Explore Library
                <FaArrowRight className="transition group-hover:translate-x-1" />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold backdrop-blur-sm transition hover:border-violet-400/50 hover:bg-white/10"
                >
                  Get started free
                </Link>
              )}
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="mt-12 flex justify-center gap-10 lg:justify-start"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual — floating book stack (no 3D spin) */}
          <motion.div style={{ y: visualY }} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="hero-glow-ring absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full md:h-96 md:w-96" />

            <div className="relative mx-auto h-[380px] w-full max-w-sm sm:h-[420px]">
              {showcaseBooks.map((book, i) => (
                <motion.div
                  key={book.title}
                  className="absolute w-[42%] max-w-[180px] sm:max-w-[200px]"
                  style={{
                    left: book.left,
                    top: book.top,
                    rotate: book.rotate,
                    zIndex: book.z,
                  }}
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  animate={{ opacity: 1, y: book.top, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    className="hero-book-card overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4 + i * 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.4,
                    }}
                    whileHover={{ scale: 1.04, rotate: book.rotate + 2 }}
                  >
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="aspect-[3/4] w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-xs font-medium text-white/90">{book.title}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Floating chips */}
            <motion.div
              className="absolute -left-2 top-8 hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl sm:block"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2 text-sm">
                <FaBook className="text-violet-400" />
                <span>Live library</span>
              </div>
            </motion.div>
            <motion.div
              className="absolute -right-2 bottom-16 hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl sm:block"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center gap-2 text-sm">
                <FaUsers className="text-fuchsia-400" />
                <span>Writer community</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Marquee strip */}
      <section className="border-y border-white/5 bg-white/[0.02] py-4">
        <div className="hero-marquee flex gap-12 whitespace-nowrap text-sm uppercase tracking-[0.2em] text-slate-500">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex shrink-0 gap-12">
              {["Fiction", "Sci-Fi", "Business", "Poetry", "History", "Design", "Mystery", "Biography"].map(
                (tag) => (
                  <span key={`${dup}-${tag}`}>{tag}</span>
                )
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">Built for readers and creators</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Everything you need to discover, discuss, and publish — in one polished experience.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.1, duration: 0.55 }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent p-7 backdrop-blur-sm transition-shadow hover:border-violet-500/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-slate-400">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/80 via-indigo-950/60 to-slate-950 p-10 md:p-14"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Start your writer journey</h2>
              <p className="mt-3 max-w-lg text-slate-300">
                Upload manuscripts, collect reviews, and reach readers worldwide.
              </p>
            </div>
            <Link
              to={user ? "/upload" : "/register"}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-violet-900 transition hover:bg-violet-50"
            >
              <FaBookOpen />
              {user ? "Upload a Book" : "Create Writer Account"}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
