# 🏗️ Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React App (Vite + React Router)                     │  │
│  │  - Pages: Home, Create, View, Collections, Login     │  │
│  │  - Components: StickerPlayer, StickerCard, etc       │  │
│  │  - Context: Auth (Google + JWT)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬─────────────────────────────────────────────────┘
             │ HTTP/REST
             ↓
┌─────────────────────────────────────────────────────────────┐
│              NODE.JS + EXPRESS (Backend)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Routes:                                              │  │
│  │  - POST /api/sticker/create (with Multer upload)    │  │
│  │  - GET /api/sticker/:id                             │  │
│  │  - GET /api/stickers/feed                           │  │
│  │  - POST /api/collection/* (CRUD)                    │  │
│  │  - POST /api/auth/callback                          │  │
│  └──────────┬─────────────────────────────────────────┘  │
│  ┌──────────┴─────────────────────────────────────────┐  │
│  │ Controllers: Handle HTTP requests                   │  │
│  │  - stickerController.js                            │  │
│  │  - collectionController.js                         │  │
│  │  - authController.js                               │  │
│  └──────────┬─────────────────────────────────────────┘  │
│  ┌──────────┴─────────────────────────────────────────┐  │
│  │ Services: Business Logic                           │  │
│  │  ├─ ffmpegService.js (Video processing)           │  │
│  │  │  ├─ processSticker()      (Combine + Encode)    │  │
│  │  │  ├─ generateThumbnail()   (Extract frame)       │  │
│  │  │  └─ getVideoMetadata()    (Duration info)       │  │
│  │  ├─ databaseService.js (DB operations)             │  │
│  │  │  ├─ createStickerRecord()                       │  │
│  │  │  ├─ getStickerById()                            │  │
│  │  │  ├─ addToCollection()                           │  │
│  │  │  └─ incrementUsesCount()                        │  │
│  │  └─ storageService.js (File storage)               │  │
│  │     ├─ uploadToStorage()   (Supabase)              │  │
│  │     ├─ deleteFromStorage() (Cleanup)               │  │
│  │     └─ getPublicUrl()      (CDN URL)               │  │
│  └──────────┬─────────────────────────────────────────┘  │
│  ┌──────────┴─────────────────────────────────────────┐  │
│  │ Middleware:                                        │  │
│  │  - verifyAuth (JWT validation)                     │  │
│  │  - optionalAuth (JWT if available)                 │  │
│  │  - Error handling                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────┬──────────┬──────────┬──────────────────────────┘
              │          │          │
              ↓          ↓          ↓
         ╔════════╗ ╔════════╗ ╔═════════╗
         ║ FFmpeg ║ │ Multer ║ │ Supabase│
         ╚════════╝ ╚════════╝ ╚═════════╝
                                    │
              ┌─────────────────────┼─────────────────────┐
              ↓                     ↓                     ↓
          ┌────────┐           ┌────────┐           ┌─────────┐
          │Database│           │ Storage│           │  Auth   │
          │ & API  │           │(Files) │           │ (OAuth) │
          └────────┘           └────────┘           └─────────┘
```

## Data Flow: Create Sticker

```
1. User uploads video + audio in React
   ↓
2. Frontend sends to POST /api/sticker/create with FormData
   ↓
3. Multer saves files to /tmp
   ↓
4. Backend validates file sizes
   ↓
5. FFmpeg processes sticker (combine, resize, compress)
   - Input: video.mp4 + audio.mp3
   - Output: sticker.webm (512x512, VP9, Opus)
   ↓
6. FFmpeg generates thumbnail from video
   ↓
7. Backend uploads processed video to Supabase Storage
   ↓
8. Backend uploads thumbnail to Supabase Storage
   ↓
9. Backend creates database record with URLs
   ↓
10. Backend cleans up /tmp files
   ↓
11. Frontend receives sticker ID + URL
   ↓
12. User is redirected to /s/:id (shareable URL)
```

## Data Flow: Share Sticker

```
1. User clicks "Share on WhatsApp"
   ↓
2. Frontend generates WhatsApp URL with message
   "😂 Tap to hear this 👇\n{sticker_url}"
   ↓
3. Opens WhatsApp with pre-filled message
   ↓
4. User sends to contacts
   ↓
5. When recipient opens link → /s/:id
   ↓
6. Meta tags populate WhatsApp preview:
   - og:title: "3s Talking Sticker by John"
   - og:image: thumbnail URL (shows in preview)
   - og:type: video.other
   ↓
7. User can tap preview → Opens in browser
   ↓
8. Video autoplays (muted), user can tap to unmute
```

## Data Flow: Collections

```
1. User creates collection "Funny Stickers"
   ↓
2. Frontend: POST /api/collection/create
   ↓
3. Backend creates collection record (user_id, name)
   ↓
4. User browses stickers, clicks "Save to Collection"
   ↓
5. Frontend: POST /api/collection/add (collectionId, stickerId)
   ↓
6. Backend creates collection_items junction record
   ↓
7. User goes to "My Packs"
   ↓
8. Frontend: GET /api/collection/:userId
   ↓
9. Backend returns collections with nested stickers
   ↓
10. User sees organized sticker packs
```

## Component Hierarchy

```
App.jsx
├── Navigation (sticky header with auth)
├── Routes
│   ├── /login
│   │   └── LoginPage
│   │       └── GoogleLogin
│   ├── /
│   │   └── HomePage
│   │       └── StickerCard (grid)
│   │           └── StickerPlayer (video)
│   ├── /create
│   │   └── CreatePage
│   │       └── CreateSticker
│   │           ├── File inputs (video, audio)
│   │           ├── StickerPlayer (preview)
│   │           └── TrimSlider
│   ├── /s/:id
│   │   └── ViewStickerPage
│   │       ├── StickerPlayer (full screen)
│   │       ├── ShareButton (WhatsApp)
│   │       └── Collections menu
│   └── /collections
│       └── CollectionsPage
│           ├── Create collection form
│           └── StickerCard grid (per collection)
│
Context:
└── AuthProvider
    └── AuthContext (user, token, login, logout)
```

## State Management

### Global State (AuthContext)
```javascript
{
  user: { id, email },
  token: "jwt-token",
  loading: false,
  isAuthenticated: true,
  login(googleUser),
  logout()
}
```

### Local State (Components)
- HomePage: stickers[], offset, hasMore, loading
- CreatePage: videoFile, audioFile, videoPreview, duration, isProcessing
- ViewStickerPage: sticker{}, collections[], selectedCollectionId, showCollectionMenu
- CollectionsPage: collections[], newCollectionName, creatingCollection

## API Contract

### Request/Response Format

**Create Sticker Request:**
```
POST /api/sticker/create
Headers: Authorization: Bearer {token}
Body: FormData
  - video: File (required)
  - audio: File (optional)

Response:
{
  success: true,
  sticker: {
    id: "uuid",
    video_url: "https://...",
    thumbnail_url: "https://...",
    duration: 3,
    share_url: "http://localhost:3000/s/uuid"
  }
}
```

**Get Sticker Feed:**
```
GET /api/stickers/feed?limit=20&offset=0

Response:
{
  stickers: [
    {
      id, video_url, thumbnail_url, duration,
      uses_count, created_at, creator
    },
    ...
  ],
  pagination: { limit, offset, count }
}
```

**Add to Collection:**
```
POST /api/collection/add
Headers: Authorization: Bearer {token}
Body:
{
  collectionId: "uuid",
  stickerId: "uuid"
}

Response:
{ success: true }
```

## Database Schema

**users**
```sql
id (UUID)
email (TEXT, UNIQUE)
created_at (TIMESTAMP)
```

**stickers**
```sql
id (UUID)
user_id (UUID) → users.id
video_url (TEXT)
thumbnail_url (TEXT)
duration (INTEGER) 2-6 seconds
uses_count (INTEGER)
created_at (TIMESTAMP)

Indexes: user_id, created_at DESC
```

**collections**
```sql
id (UUID)
user_id (UUID) → users.id
name (TEXT)
created_at (TIMESTAMP)

Indexes: user_id, created_at DESC
```

**collection_items**
```sql
id (UUID)
collection_id (UUID) → collections.id
sticker_id (UUID) → stickers.id

Constraints: UNIQUE (collection_id, sticker_id)
Indexes: collection_id, sticker_id
```

## Security Measures

1. **Authentication**
   - Google OAuth via Supabase Auth
   - JWT tokens in localStorage
   - Bearer token in Authorization header

2. **Authorization**
   - Supabase RLS policies
   - Backend middleware verification
   - User ID isolation

3. **Input Validation**
   - File size limits (100MB video, 50MB audio)
   - File type whitelist
   - FormData validation

4. **File Processing**
   - FFmpeg runs in isolated process
   - Input/output validation
   - Temp file cleanup
   - Size limit validation (<500KB output)

## Scalability Considerations

### Current Limitations
- Single server instance
- Synchronous FFmpeg processing
- In-memory request handling
- No caching layer

### Future Improvements
1. **Message Queue** (Redis, Bull)
   - Async sticker processing
   - Retry mechanism
   - Rate limiting

2. **Caching Layer**
   - Cache popular stickers
   - Cache user collections
   - Redis for session store

3. **CDN**
   - Serve video from CDN (CloudFront, Bunny)
   - Reduce bandwidth costs
   - Faster playback globally

4. **Database Optimization**
   - Read replicas for feed queries
   - Connection pooling
   - Query optimization

5. **Horizontal Scaling**
   - Load balancer (Nginx)
   - Multiple backend instances
   - Shared temp storage (S3)

## Monitoring & Logging

### Backend Logging
```javascript
console.log('Processing sticker with FFmpeg...');
console.error('Sticker creation error:', error);
```

### Frontend Error Tracking
```javascript
try {
  // operations
} catch (error) {
  console.error('Operation failed:', error);
  // Could integrate Sentry
}
```

### Metrics to Track
- API response times
- FFmpeg processing duration
- File upload success rate
- Database query performance
- Storage usage

---

This architecture is designed for:
✅ Quick iteration & feature development
✅ Easy debugging & testing
✅ Minimal infrastructure complexity
✅ Horizontal scaling path
✅ Cost-effective MVP
