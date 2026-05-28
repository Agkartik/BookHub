# BookHub — A Next-Gen Full-Stack Reading Platform

**BookHub** is a premium, full-stack MERN (MongoDB, Express, React, Node.js) reading and publishing platform that bridges the gap between readers and writers in one beautifully crafted digital library experience.

## 🚀 What is BookHub?

BookHub is designed for two kinds of users — **readers** who love discovering and consuming stories, and **writers** who want to publish their manuscripts, reach a real audience, and curate an immersive reading atmosphere for their work.

## ✨ Key Features

**For Readers:**
- Browse a rich catalog of books across genres — Fiction, Sci-Fi, Mystery, Poetry, Adventure, and more
- Immersive distraction-free **Book Reader** with flowing and dual-page flip layouts
- **Text-to-Speech audiobook** mode with sentence-level precision, speed control, and voice selection
- Save and sync **reading progress** automatically across sessions
- Highlight and annotate any paragraph with color-coded marks and personal notes
- Chat with an **AI Book Companion** for spoiler-free chapter Q&A
- Attach and stream **ambient background music** while reading for deep focus
- Upload a custom **profile picture** and manage your reader identity

**For Writers:**
- Publish full manuscripts with chapters, cover images, and metadata
- Curate and attach a **custom ambient music track** exclusively for your book's reading experience
- View a dedicated **Writer Dashboard** with performance analytics

**For Admins:**
- Full user moderation — remove misbehaving readers or writers with automatic cascade cleanup
- Content flagging and community reporting pipeline

## 🎨 Premium Design System

BookHub features a **glassmorphism-first design** with animated glowing background blobs that dynamically morph their colors based on each book's mood and genre — a cinematic, hardware-accelerated experience that runs at a buttery-smooth 60+ FPS. Readers can customize their interface with dark/light themes, reduce-motion mode, and toggle glassmorphism on or off from the Settings panel.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, GSAP |
| Backend | Node.js, Express.js, MongoDB Atlas, Mongoose |
| Auth | JWT (JSON Web Tokens) |
| File Uploads | Multer |
| Deployment | Vercel (Frontend) + Render (Backend) |

## 🔐 Default Login Credentials (Demo)

| Role | Email | Password |
|---|---|---|
| Admin | admin@bookverse.com | Admin@12345 |
| Writer | writer@bookverse.com | Writer@12345 |
| Reader | reader@bookverse.com | Reader@12345 |

## ⚙️ Running Locally

**1. Clone the repository**
```bash
git clone https://github.com/Agkartik/BookHub.git
cd BookHub
```

**2. Setup Backend**
```bash
cd backend
cp .env.example .env   # Fill in your MongoDB URI and JWT secret
npm install
npm run dev
```

**3. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:3000` and the API at `http://localhost:5001`.

## 🌐 Environment Variables

### Backend (`backend/.env`)
```
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_string
CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:5001/api
```

## 📁 Project Structure

```
BookHub/
├── backend/          # Express API server
│   ├── controllers/  # Route handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── middleware/   # Auth & upload middleware
│   └── server.js     # Entry point
└── frontend/         # React Vite client
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page-level components
    │   ├── services/    # API service functions
    │   ├── hooks/       # Custom React hooks
    │   └── utils/       # Utility functions
    └── vercel.json      # Vercel SPA routing config
```

---

Built with ❤️ by Agkartik
