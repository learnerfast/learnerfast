# Video Upload and Playback Setup

## Database Setup

1. **Create the required tables** by running:
   ```bash
   ./setup-database.sh
   ```
   
   Or manually execute the SQL in `create-course-tables.sql` in your Supabase dashboard.

## Supported Video Platforms

### 1. **Vimeo**
- **Format**: `https://vimeo.com/123456789`
- **Embed**: Automatically converts to player URL
- **Features**: Clean player with no branding

### 2. **YouTube**
- **Format**: `https://youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
- **Embed**: Automatically converts to embed URL
- **Features**: Minimal branding, no related videos

### 3. **VdoCipher**
- **Format**: Direct embed URL from VdoCipher
- **Security**: Supports DRM-protected content

### 4. **Gumlet**
- **Format**: Direct Gumlet video URL
- **Features**: Optimized video delivery

### 5. **Generic Iframe**
- **Format**: Any valid video URL or iframe embed code
- **Auto-detection**: Automatically detects YouTube/Vimeo URLs

### 6. **Script Embed**
- **Format**: Raw HTML/JavaScript embed code
- **Use case**: Custom video players, advanced embeds

## Troubleshooting Video Issues

### Videos Not Playing

1. **Check the URL format**:
   - Ensure the URL is valid and accessible
   - For YouTube: Use `https://youtube.com/watch?v=VIDEO_ID`
   - For Vimeo: Use `https://vimeo.com/VIDEO_ID`

2. **Browser Console Errors**:
   - Open browser dev tools (F12)
   - Check for CORS or iframe errors
   - Look for 404 or permission errors

3. **Database Issues**:
   - Verify tables exist: `courses` and `course_videos`
   - Check RLS policies are properly set
   - Ensure user authentication is working

### Common Fixes

1. **CORS Issues**: Some video platforms block embedding on certain domains
2. **Mixed Content**: Ensure HTTPS URLs for video sources
3. **Permissions**: Check if videos are publicly accessible
4. **URL Parameters**: Some URLs with tracking parameters may not work

## Testing Video Upload

1. **Create a course** in the dashboard
2. **Click "Upload" button** on the course card
3. **Select video type** from dropdown
4. **Enter video URL** or embed code
5. **Click "Add Video"** to save
6. **Click "Play"** to test playback

## Video Player Features

- **Full-screen modal** for better viewing experience
- **Error handling** with user-friendly messages
- **Multiple format support** with automatic URL conversion
- **Responsive design** that works on all devices
- **Security attributes** for safe iframe embedding

## Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Need Help?

If videos still aren't playing:

1. Check the browser console for errors
2. Verify the video URL works in a regular browser
3. Test with a simple YouTube video first
4. Ensure your Supabase database is properly configured
5. Check that RLS policies allow your user to access the videos