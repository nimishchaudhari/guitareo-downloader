# Guitareo Video Downloader

A utility to help download videos from Guitareo Method sections.

> ⚠️ **Disclaimer**: This tool is for personal use only. Please respect Guitareo's terms of service and only use this to download content that you have paid for and have access to. Do not distribute downloaded content.

## Features

- Automatically finds lesson videos in Guitareo Method sections
- Downloads videos in the highest available quality
- Organizes downloaded files with proper filenames based on lesson titles
- Tracks download progress and history
- Works directly in your browser - no installation needed
- Multiple methods for finding and downloading videos

## Installation Options

### Option 1: Browser Console Method (Recommended)

1. Navigate to the Guitareo Method page: [https://www.musora.com/guitareo/method/guitareo-method/333652](https://www.musora.com/guitareo/method/guitareo-method/333652)
2. Make sure you're logged in to your Guitareo account
3. Open your browser's developer console:
   - Chrome/Edge: Press F12 or Ctrl+Shift+I (or Cmd+Option+I on Mac)
   - Firefox: Press F12 or Ctrl+Shift+I (or Cmd+Option+I on Mac)
   - Safari: Enable Developer Menu in preferences, then press Cmd+Option+I
4. Copy the entire content of [guitareo-downloader.js](guitareo-downloader.js) 
5. Paste it into the console and press Enter
6. The downloader will initialize and provide further instructions

### Option 2: Bookmarklet Method

1. Create a new bookmark in your browser
2. Give it a name like "Guitareo Downloader"
3. Instead of a URL, paste the content of [bookmarklet.js](bookmarklet.js) 
4. Save the bookmark
5. When you're on a Guitareo page, click the bookmark to activate the downloader

## Usage Guide

Once the downloader is loaded, you can use the following commands in your browser console:

### Basic Workflow

```javascript
// 1. Find all lesson links on the current method page
GuitareoDownloader.findLessonLinks();

// 2. Navigate to the first lesson
GuitareoDownloader.navigateToNextLesson();

// 3. Once the video loads, download it
GuitareoDownloader.downloadCurrentVideo();

// 4. Go back to the method page
GuitareoDownloader.goToMethodPage();

// 5. Repeat steps 2-4 for each lesson
// ...
```

### All Available Commands

| Command | Description |
|---------|-------------|
| `GuitareoDownloader.findLessonLinks()` | Scans the current page for lesson cards and stores them |
| `GuitareoDownloader.downloadCurrentVideo([customFilename])` | Downloads the video currently playing on the page |
| `GuitareoDownloader.navigateToNextLesson()` | Navigates to the next unvisited lesson |
| `GuitareoDownloader.navigateToLesson(index)` | Navigates to a specific lesson by its index |
| `GuitareoDownloader.downloadWithVimeoId(vimeoId, [customFilename])` | Downloads a video using its Vimeo ID directly |
| `GuitareoDownloader.goToMethodPage()` | Navigates back to the main method page |
| `GuitareoDownloader.showStats()` | Shows statistics about found lessons and downloads |
| `GuitareoDownloader.reset()` | Resets the state of the downloader |
| `GuitareoDownloader.setDebugMode(enabled)` | Enables or disables debug logging |
| `GuitareoDownloader.help()` | Shows the help message with all commands |

## Troubleshooting

### Video Not Found

If the downloader cannot find a video on the page:

1. Make sure the video has fully loaded
2. Check that the video is actually playing
3. Try refreshing the page and loading the downloader again

### Cannot Find Lesson Links

If the downloader doesn't find any lesson links:

1. Make sure you're on the correct Guitareo Method page
2. Check if the page layout has changed (this might require an update to the tool)
3. Try using the Vimeo ID method instead (look for Vimeo IDs in the page source)

### Download Not Starting

If clicking the download button doesn't start a download:

1. Check your browser's popup blocker settings
2. Make sure you're allowing downloads from the site
3. Try using a different browser

## Advanced Usage

### Download by Vimeo ID

If you know the Vimeo ID of a video, you can download it directly:

```javascript
GuitareoDownloader.downloadWithVimeoId("12345678", "custom-filename.mp4");
```

### Custom Filenames

You can specify custom filenames when downloading:

```javascript
GuitareoDownloader.downloadCurrentVideo("my-custom-filename.mp4");
```

### Debug Mode

Enable debug mode to see more detailed logging:

```javascript
GuitareoDownloader.setDebugMode(true);
```

## How It Works

This tool works by:

1. Finding lesson cards on the Guitareo Method page
2. Navigating to each lesson page
3. Identifying the video element loaded on the page
4. Extracting the direct video URL (typically from Vimeo)
5. Triggering a download using the browser's download API
6. Tracking download progress and history

No data is sent to external servers - everything happens in your browser.

## Contributing

Feel free to submit issues or pull requests if you have improvements or bug fixes.

## License

MIT License - See [LICENSE](LICENSE) for details.
