<div align="center" >
  <br/>
  <br/>
  <img src="/src/assets/svg/nextsound.svg" alt="NextSound logo" width="80" height="auto" />
  <h1>NextSound</h1>
  <br/>

  <p >
A music discovery app built with React and TypeScript. <br/> Browse tracks, albums, and artists using Spotify's API. <br/> Build playlists with queue management, like your favorite tracks, and create an account to save your preferences.
  </p>
</div>

<br/>
<br/>

## Features

### 🎵 Queue Management
- **Add to Queue**: Click the "+" button on any track card to add it to your queue
- **Queue Panel**: Slide-in panel from the right side showing your current queue
- **Drag & Drop**: Reorder tracks by dragging them in the queue panel
- **Remove Tracks**: Remove individual tracks or clear the entire queue
- **Auto-play**: Queue integrates with the audio player for seamless playback
- **Persistence**: Your queue is saved to localStorage and restored when you return

### ❤️ Likes System
- **Like Tracks**: Click the heart button on track cards to like/unlike tracks
- **Like Counts**: See how many users have liked each track
- **User-Specific Likes**: When signed in, your likes are saved to your account
- **Visual Feedback**: Filled red heart for liked tracks, outline for unliked
- **Database Storage**: All likes are stored securely in Supabase with track metadata

### 🔐 User Authentication
- **Sign Up & Sign In**: Create an account or sign in with email and password
- **User Profiles**: Each user has a profile with username and email
- **Secure Storage**: User data protected with Row-Level Security (RLS) policies
- **User Menu**: Access your profile and sign out from the header menu
- **Persistent Sessions**: Your session persists across page refreshes

<br/>

## How it works

NextSound runs in two modes depending on your setup:

### Demo mode (no API needed)
Without API credentials:
- Curated collection of 2024-2025 chart toppers
- Works immediately after `git clone` and `npm install`
- Real album artwork and track metadata
- Features artists like Billie Eilish, Harry Styles, Morgan Wallen, and more

Benefits:
- Perfect for trying out the app quickly
- No API setup required
- Images load from Spotify CDN
- Shows off the full UI

<br/>


### With Spotify API (recommended)
If you have Spotify API credentials:
- Real-time access to Spotify's music catalog
- Search across millions of tracks, albums, and artists
- Latest trending songs and new releases
- All features available

Requires:
- Spotify API credentials in `.env` file
- Backend server running for CORS handling

<br/>


The app automatically detects which mode to use.

<br/>


## :camera: Screenshots

### Hero Section
<kbd><img width="800" alt="NextSound Hero Section and Track Grid" src="./src/assets/images/hero.png"></kbd>

<br/>

### Homepage
<kbd><img width="800" alt="NextSound Homepage with Music Content" src="./src/assets/images/all-songs.png"></kbd>


<br/>
<br/>

## Getting started

You need Node.js 18+ and npm.

```bash
# Clone and install
git clone https://github.com/natashaongiscoding/music-app.git
cd music-app
npm install

# Start the app
npm run dev
```

Open `http://localhost:5173` - the app works immediately with demo data.

<br>

### Want live Spotify data?

1. Create a [Spotify Developer Account](https://developer.spotify.com/) and create a new app
2. Get your Client ID and Client Secret from the app dashboard
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Add your credentials to `.env` (remove the # comments):
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```
5. Start with the backend:
   ```bash
   npm run dev:full
   ```

<br/>

### Setting up Supabase (for Likes & Authentication)

To enable likes and user authentication features:

1. Create a [Supabase Account](https://supabase.com/) and create a new project
2. Get your project URL and anon key from the project settings:
   - Go to Project Settings → API
   - Copy the "Project URL" and "anon public" key
3. Add your Supabase credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
4. Database tables are automatically created via migrations:
   - `user_profiles` - Stores user account information
   - `user_track_likes` - Stores user-specific track likes
   - Row-Level Security (RLS) policies ensure users can only access their own data

**Note**: The app works without Supabase credentials, but likes and authentication features will be disabled.

<br/>

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

<br/>

## Build

```bash
npm run build
npm run preview
```

<br/>

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **State:** Redux Toolkit with RTK Query, React Context API
- **Routing:** React Router v6
- **Animations:** Framer Motion
- **Backend:** Node.js, Express.js (CORS proxy)
- **Database:** Supabase (PostgreSQL with Row-Level Security)
- **Authentication:** Supabase Auth
- **API:** Spotify Web API
- **Testing:** Vitest, Playwright

<br>

## Troubleshooting

### Common Issues

**CORS Errors with Spotify API**
- **Problem:** API requests fail due to CORS restrictions
- **Solution:** Ensure the backend server is running (`npm run dev:full` or `npm run server:dev`)
- **Details:** Spotify Web API cannot be called directly from browsers due to CORS policy

**Missing Environment Variables**
- **Problem:** App shows "No music data available" or API errors
- **Solution:** Check that `.env` file exists with valid Spotify credentials
- **Reference:** See `SPOTIFY_SETUP.md` for obtaining API credentials

**Port Conflicts**
- **Frontend (Port 5173):** Check if another Vite/dev server is running
- **Backend (Port 3001):** Check if another Express server is using the port
- **Solution:** Kill existing processes or modify port configuration

**Build/TypeScript Errors**
- **Problem:** TypeScript compilation errors during build
- **Solution:** Run `npm run build` to see specific error details
- **Common fix:** Ensure all dependencies are installed (`npm install`)

**Supabase Authentication Errors**
- **Problem:** "Missing Supabase environment variables" error
- **Solution:** Ensure `.env` file contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Details:** Likes and authentication features require Supabase credentials

**Database Connection Issues**
- **Problem:** Likes not saving or authentication not working
- **Solution:** Verify Supabase project is active and credentials are correct
- **Check:** Ensure database tables (`user_profiles`, `user_track_likes`) exist in your Supabase project

<br/>

### Getting Help
- See `SPOTIFY_SETUP.md` for API setup guidance
- [Reach out to the NextWork community to ask your question!](https://community.nextwork.org/c/i-have-a-question/)

---

<div align="center">
  <p>Built with ❤️ for music lovers everywhere</p>
  <p>Discover your next favorite track with NextSound</p>
</div>
