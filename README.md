# ![t-stickers logo](./client/public/t-sticker-logo.svg) t-stickers Platform

A production-ready platform for creating, sharing, and discovering `talking-stickers`🗣️

## 🎯 Features

- **🎥 Sticker Creation**: Upload video/GIF + audio, automatic FFmpeg processing
- **📱 WhatsApp Sharing**: Direct share to WhatsApp with pre-formatted message
- **🎨 Feed & Discovery**: Browse latest stickers, infinite scroll
- **💾 Collections**: Save stickers into custom collections/packs
- **🔐 Google Authentication**: Seamless login via Google + Supabase
- **🎧 Smart Playback**: Autoplay, loop, muted by default, tap to unmute
- **📊 Analytics**: Track sticker usage count
- **🌐 Public Links**: Each sticker gets a shareable URL with Open Graph tags

## 🛠️ Tech Stack

### Backend
- **Node.js + Express** - API server
- **Supabase** - Database (PostgreSQL), Auth, File Storage
- **FFmpeg** - Video processing & compression
- **Multer** - File upload handling

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **FFmpeg** installed (macOS: `brew install ffmpeg`)
- **Supabase Account** (free tier works)
- **Google OAuth Credentials** for authentication

## 🚀 Setup Guide

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Note your `Project URL` and `Anon Key`
3. Go to **Storage** and create a bucket named `stickers` (public)
4. Run the SQL schema from `DATABASE_SCHEMA.sql` in the SQL editor

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000` to authorized redirect URIs
6. Copy the **Client ID**

### 3. Backend Setup

```bash
cd server
npm install

# Create .env file with:
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
PORT=5001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret

# Start development server
npm run dev
```

**Prerequisites:**
- FFmpeg must be installed and in PATH
- On macOS: `brew install ffmpeg`
- On Ubuntu: `sudo apt-get install ffmpeg`

### 4. Frontend Setup

```bash
cd client
npm install

# Create .env file with:
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_client_id

# Start dev server (port 3000)
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
t-stickers/
├── server/
│   ├── config/          # Supabase client setup
│   ├── controllers/      # Route handlers
│   ├── services/        # Business logic (FFmpeg, DB, Storage)
│   ├── middleware/      # Auth, error handling
│   ├── routes/          # Express routes
│   ├── utils/           # File utilities
│   ├── server.js        # Entry point
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page routes
    │   ├── hooks/        # Custom React hooks
    │   ├── context/      # Auth context
    │   ├── utils/        # API & Supabase clients
    │   ├── App.jsx       # Main App component
    │   └── index.jsx     # Entry point
    ├── public/
    ├── vite.config.js
    └── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/callback` - Google OAuth callback
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/logout` - Logout

### Stickers
- `POST /api/sticker/create` - Create sticker (video + audio upload)
- `GET /api/sticker/:id` - Get single sticker
- `GET /api/stickers/feed` - Get paginated feed

### Collections
- `POST /api/collection/create` - Create collection
- `GET /api/collection/:userId` - Get user's collections
- `POST /api/collection/add` - Add sticker to collection
- `POST /api/collection/remove` - Remove sticker from collection

## 🎬 Media Processing

FFmpeg processes stickers with these settings:
- **Container**: WebM format
- **Dimensions**: 512x512px (maintains aspect ratio + transparent padding)
- **Codec**: VP9 video + Opus audio
- **Bitrate**: 300kbps video, 64kbps audio
- **Frame rate**: 15fps (smaller file size)
- **Duration**: 2-6 seconds
- **Target size**: <500KB

## 🌐 Frontend Pages

- `/` - Feed (browse all stickers)
- `/login` - Google OAuth login
- `/s/:id` - Single sticker view (public, shareable)
- `/create` - Create new sticker
- `/collections` - Manage collection/packs

## 📱 UI/UX Features

- **Dark theme** - Easy on the eyes
- **Responsive design** - Mobile-first
- **No video controls** - Stickers feel native
- **Autoplay + Loop** - Seamless experience
- **Tap to unmute** - Mobile-friendly sound control
- **WhatsApp integration** - One-tap sharing

## 🔒 Security

- JWT tokens for session management
- Supabase Row-Level Security (RLS) policies
- User isolation - Can only access own collections
- File size validation (100MB video, 50MB audio)
- Safe FFmpeg processing with timeouts

## 📊 Database Schema

### users
- `id` (UUID) - Primary key
- `email` (TEXT) - Unique
- `created_at` (TIMESTAMP)

### stickers
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `video_url` (TEXT) - Processed WebM URL
- `thumbnail_url` (TEXT) - Thumbnail image
- `duration` (INTEGER) - Seconds (2-6)
- `uses_count` (INTEGER) - View count
- `created_at` (TIMESTAMP)

### collections
- `id` (UUID)
- `user_id` (UUID) - Foreign key
- `name` (TEXT)
- `created_at` (TIMESTAMP)

### collection_items
- `id` (UUID)
- `collection_id` (UUID) - Foreign key
- `sticker_id` (UUID) - Foreign key

## 🚦 Development Workflow

1. **Backend first**: Start with `npm run dev` in `/server`
2. **Test APIs**: Use curl or Postman
3. **Frontend**: Run `npm run dev` in `/client`
4. **Hot reload**: Both apps support hot reloading

## 🐛 Common Issues

### FFmpeg not found
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Add to PATH if needed
```

### 413 Payload Too Large
Increase payload limit in `server.js` (already set to 100MB)

### CORS errors
Check `FRONTEND_URL` in server `.env` matches your frontend domain

### Supabase RLS blocking requests
Ensure `.env` has `SUPABASE_SERVICE_ROLE_KEY` for admin operations

## 📈 Deployment

### Backend (Node.js)
- Deploy to Render, Railway, or Heroku
- Set environment variables
- Ensure FFmpeg is available in environment

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or GitHub Pages
- Update `VITE_API_URL` to production backend URL

## 🎁 Future Enhancements

- [ ] Trending stickers algorithm
- [ ] User profiles & followers
- [ ] Comments & reactions
- [ ] Sticker editing (trim, effects)
- [ ] Queue system for large uploads
- [ ] CDN optimization
- [ ] Mobile app (React Native)
- [ ] Sticker packs marketplace
- [ ] Push notifications

## 📄 License

MIT

## 👨‍💻 Author

Built as a production-ready MVP for the Talking Sticker Platform.

---

**Happy sticker-making! 🎬✨**
