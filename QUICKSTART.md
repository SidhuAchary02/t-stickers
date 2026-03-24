# 🎯 Quick Start Guide

Get the t-stickers Platform running locally in 10 minutes!

## ⚡ Prerequisites

Before you start, ensure you have:

1. **Node.js 16+** - [Download](https://nodejs.org/)
2. **FFmpeg** - Required for video processing
   - macOS: `brew install ffmpeg`
   - Ubuntu: `sudo apt-get install ffmpeg`
   - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
3. **Supabase Account** - [Sign up free](https://supabase.com)
4. **Google OAuth Credentials** - [Get from Google Cloud](https://console.cloud.google.com)

## 📦 Step 1: Supabase Setup (5 minutes)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Save your password securely
   - Note the **Project URL** and **Anon Key**

2. **Run Database Schema**
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `DATABASE_SCHEMA.sql`
   - Paste and execute

3. **Create Storage Bucket**
   - Go to Storage → Buckets
   - Click "New Bucket"
   - Name: `stickers`
   - Set to **Public**

4. **Get Service Role Key**
   - Go to Settings → API
   - Copy **Service Role** (secret) key

## 🔑 Step 2: Google OAuth Setup (3 minutes)

1. **Create Google Cloud Project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project
   - Name it "t-stickers"

2. **Enable Google+ API**
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to Credentials → Create → OAuth Client ID
   - Select "Web application"
   - Add authorized origin: `http://localhost:3000`
   - Add authorized redirect URI: `http://localhost:3000`
   - Copy **Client ID**

## 🖥️ Step 3: Backend Setup (2 minutes)

```bash
cd server
npm install
```

Create `.env` file:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
PORT=5001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
```

Start backend:
```bash
npm run dev
```

Expected output:
```
🎥 t-stickers Server running on port 5001
📍 http://localhost:5001
```

## 🎨 Step 4: Frontend Setup (2 minutes)

```bash
cd client
npm install
```

Create `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=1234567890-abc...
```

Start frontend:
```bash
npm run dev
```

Open browser to: **http://localhost:3000**

## 🧪 Step 5: Test the Application

### 1. Authentication Test
- Click "Login" with Google
- Should redirect to login page
- Check browser console for errors
- You should be redirected to home page

### 2. Create a Sticker
- Go to "Create" page
- Upload a short video (MP4 or GIF)
- Optionally upload audio (MP3)
- Click "Create Sticker"
- Wait for FFmpeg processing (~10-30 seconds)
- Should see success message with shareable URL

### 3. View Sticker
- Click on created sticker
- Video should autoplay (muted)
- Click to toggle sound
- Tap "Share on WhatsApp" button
- Should open WhatsApp with pre-formatted message

### 4. Collections
- Go to "My Packs"
- Create a new collection
- Go back to any sticker
- Click "Save to Collection"
- Verify it appears in your collection

## 🐛 Troubleshooting

### FFmpeg not found
```bash
# Check if FFmpeg is installed
ffmpeg -version

# If not, install:
brew install ffmpeg         # macOS
sudo apt-get install ffmpeg # Ubuntu
```

### CORS errors
- Ensure backend is running on port 5001
- Check `VITE_API_URL` matches backend URL
- Verify CORS is enabled in Express (already done)

### Google login not working
- Verify `VITE_GOOGLE_CLIENT_ID` is correct
- Check Google OAuth credentials have correct origins
- Clear browser cookies and try again

### Video upload fails
- Check file size (max 100MB)
- Verify video format (MP4, MOV, GIF)
- Check backend has write access to `/tmp`

### Sticker creation hangs
- FFmpeg might be slow (30-60 seconds is normal)
- Check server logs for errors
- Ensure output is <500KB

## 📊 Monitor Processing

### Check Backend Logs
```bash
# Server logs show processing status
# Look for "Processing sticker with FFmpeg..." messages
```

### Check Supabase
- Go to Storage → stickers
- Should see video files after successful upload
- Go to Database → stickers
- Should see new records with video URLs

## 🎯 Next Steps

Once everything works:

1. **Explore the code** - See how components fit together
2. **Customize styling** - Update Tailwind colors
3. **Add features** - Try implementing trending stickers
4. **Deploy** - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📚 File Structure You'll See

```
server/
  ✅ server.js (running)
  ✅ services/ffmpegService.js (processing videos)
  ✅ controllers/stickerController.js (handling uploads)

client/
  ✅ src/App.jsx (routing)
  ✅ src/pages/CreatePage.jsx (upload UI)
  ✅ src/components/CreateSticker.jsx (file handling)
```

## 🆘 Still Having Issues?

1. **Check ports**
   ```bash
   # Port 5001 (backend)
   lsof -i :5001
   
   # Port 3000 (frontend)
   lsof -i :3000
   ```

2. **Clear cache**
   ```bash
   # Browser: Delete cookies/storage
   # Terminal: rm -rf node_modules && npm install
   ```

3. **Check environment variables**
   - `.env` files should be in `server/` and `client/`
   - Don't use quotes in values
   - Restart servers after changing `.env`

4. **Review logs**
   - Backend logs in terminal: Watch for errors
   - Frontend console: Open DevTools (F12)
   - Supabase dashboard: Check logs under Settings

## ✅ Success Checklist

- [ ] Node.js installed and v16+
- [ ] FFmpeg installed and accessible
- [ ] Supabase database schema created
- [ ] Storage bucket "stickers" created
- [ ] Google OAuth client ID obtained
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured  
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] Can login with Google
- [ ] Can upload and process sticker
- [ ] Can view sticker and share to WhatsApp

🎉 **Once all checked, you're ready to build!**

---

For more info, see [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
