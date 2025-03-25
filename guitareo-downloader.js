/**
 * Guitareo Video Downloader
 * A utility to help download videos from Guitareo Method sections.
 * 
 * Usage:
 * 1. Navigate to https://www.musora.com/guitareo/method/guitareo-method/333652
 * 2. Open your browser's developer console (F12 or Ctrl+Shift+I)
 * 3. Copy and paste this entire script into the console
 * 4. Follow the instructions printed in the console
 */

(function() {
  // Create global Guitareo downloader object
  window.GuitareoDownloader = {
    // Store found lessons
    lessons: [],
    
    // Store downloaded videos
    downloaded: [],
    
    // Debug mode flag
    debug: false,
    
    /**
     * Log messages (only if debug mode is enabled)
     * @param {string} message - Message to log
     * @param {any} data - Optional data to log
     */
    log: function(message, data) {
      if (this.debug) {
        if (data) {
          console.log(`[GuitareoDownloader] ${message}`, data);
        } else {
          console.log(`[GuitareoDownloader] ${message}`);
        }
      }
    },
    
    /**
     * Enable or disable debug logging
     * @param {boolean} enabled - Whether debug logging should be enabled
     */
    setDebugMode: function(enabled) {
      this.debug = !!enabled;
      console.log(`[GuitareoDownloader] Debug mode ${this.debug ? 'enabled' : 'disabled'}`);
    },
    
    /**
     * Extract Vimeo ID from the current page HTML
     * @returns {string|null} The Vimeo ID or null if not found
     */
    getVimeoId: function() {
      const regex = /vimeo.+?(\d{6,})/g;
      const matches = [];
      const html = document.documentElement.innerHTML;
      
      let match;
      while ((match = regex.exec(html)) !== null) {
        matches.push(match[1]);
      }
      
      this.log('Vimeo IDs found:', matches);
      return matches.length > 0 ? matches[0] : null;
    },
    
    /**
     * Get the lesson title from the current page
     * @returns {string} Extracted title or 'Unknown Lesson' if not found
     */
    getLessonTitle: function() {
      // Try various elements that might contain the title
      const selectors = [
        'h1', 'h2', 'h3', '.title', '[class*="title"]',
        '[class*="heading"]', '[class*="lesson-name"]'
      ];
      
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent?.trim()) {
          this.log(`Found title in element ${selector}:`, el.textContent.trim());
          return el.textContent.trim();
        }
      }
      
      // If no title found, try to get it from the URL
      const pathParts = window.location.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== '333652') {
        this.log('Extracted title from URL:', lastPart.replace(/-/g, ' '));
        return lastPart.replace(/-/g, ' ');
      }
      
      this.log('No title found, using default');
      return 'Unknown Lesson';
    },
    
    /**
     * Creates a safe filename from a string
     * @param {string} input - The string to convert to a safe filename
     * @returns {string} A safe filename
     */
    createSafeFilename: function(input) {
      return input
        .trim()
        .replace(/[^a-z0-9]/gi, '-') // Replace non-alphanumeric with hyphens
        .replace(/-+/g, '-')         // Replace multiple hyphens with a single one
        .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
        .toLowerCase() + '.mp4';     // Convert to lowercase and add extension
    },
    
    /**
     * Download the video currently displayed on the page
     * @param {string} [customFilename] - Optional custom filename for the download
     * @returns {boolean} Whether the download was started successfully
     */
    downloadCurrentVideo: function(customFilename) {
      const video = document.querySelector('video');
      if (!video || !video.currentSrc) {
        console.error('[GuitareoDownloader] No video element with source found');
        return false;
      }
      
      // Get a cleaned filename
      const title = this.getLessonTitle();
      const filename = customFilename || this.createSafeFilename(title);
      
      try {
        // Create download link
        const a = document.createElement('a');
        a.href = video.currentSrc;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Remove the link after a short delay
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
        
        // Record this download
        this.downloaded.push({
          title: title,
          url: video.currentSrc,
          filename: filename,
          date: new Date().toISOString()
        });
        
        console.log(`[GuitareoDownloader] Started download of "${filename}"`);
        return true;
      } catch (error) {
        console.error('[GuitareoDownloader] Error downloading video:', error);
        return false;
      }
    },
    
    /**
     * Find all lesson links/cards on the method page
     * @returns {Array} Array of lesson objects
     */
    findLessonLinks: function() {
      // Reset lessons array
      this.lessons = [];
      
      // Get all SVG elements that might be play buttons
      const svgElements = document.querySelectorAll('svg');
      console.log(`[GuitareoDownloader] Examining ${svgElements.length} SVG elements for lesson cards...`);
      
      // Check if we're on the method page
      if (!window.location.href.includes('/method/')) {
        console.warn('[GuitareoDownloader] Not on a method page. Please navigate to the Guitareo Method page first.');
        return this.lessons;
      }
      
      // For each SVG, find its parent container which might be a lesson card
      svgElements.forEach((svg, index) => {
        // Look for parent up to 5 levels up
        let parent = svg.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          // Get title text from this parent if it exists
          let titleText = '';
          const titleElements = parent.querySelectorAll('h1, h2, h3, h4, h5, .title, [class*="title"]');
          
          if (titleElements.length > 0) {
            titleText = titleElements[0].textContent.trim();
          } else if (parent.textContent) {
            // Try to extract a title-like text from the parent
            const text = parent.textContent.trim();
            if (text.length < 100) { // Probably a title if it's short
              titleText = text;
            }
          }
          
          // If we found title text, add this parent as a potential lesson
          if (titleText && !this.lessons.some(l => l.title === titleText)) {
            this.log(`Found lesson card: "${titleText}"`);
            this.lessons.push({
              element: parent,
              title: titleText,
              index: this.lessons.length + 1,
              visited: false,
              downloaded: false
            });
            break; // Found a parent with title, stop looking up
          }
          
          parent = parent.parentElement;
        }
      });
      
      // Sort lessons by their Y position on the page (top to bottom)
      this.lessons.sort((a, b) => {
        const rectA = a.element.getBoundingClientRect();
        const rectB = b.element.getBoundingClientRect();
        return rectA.top - rectB.top;
      });
      
      // Update indices after sorting
      this.lessons.forEach((lesson, idx) => {
        lesson.index = idx + 1;
      });
      
      console.log(`[GuitareoDownloader] Found ${this.lessons.length} lesson cards`);
      
      // Display the list of lessons
      if (this.lessons.length > 0) {
        console.log('[GuitareoDownloader] Lessons found:');
        this.lessons.forEach(lesson => {
          console.log(`  ${lesson.index}. ${lesson.title}`);
        });
      }
      
      return this.lessons;
    },
    
    /**
     * Navigate to a specific lesson by index
     * @param {number} index - The index of the lesson to navigate to
     * @returns {boolean} Whether navigation was successful
     */
    navigateToLesson: function(index) {
      if (this.lessons.length === 0) {
        console.error('[GuitareoDownloader] No lessons found. Run findLessonLinks() first.');
        return false;
      }
      
      // Find the lesson with the given index
      const lesson = this.lessons.find(l => l.index === index);
      if (!lesson) {
        console.error(`[GuitareoDownloader] Lesson with index ${index} not found.`);
        return false;
      }
      
      // Mark this lesson as visited
      lesson.visited = true;
      
      // Try to click the element
      try {
        console.log(`[GuitareoDownloader] Navigating to lesson ${index}: "${lesson.title}"`);
        lesson.element.click();
        return true;
      } catch (error) {
        console.error(`[GuitareoDownloader] Error navigating to lesson ${index}:`, error);
        return false;
      }
    },
    
    /**
     * Navigate to the next unvisited lesson
     * @returns {boolean} Whether navigation was successful
     */
    navigateToNextLesson: function() {
      if (this.lessons.length === 0) {
        console.error('[GuitareoDownloader] No lessons found. Run findLessonLinks() first.');
        return false;
      }
      
      // Find the next unvisited lesson
      const nextLesson = this.lessons.find(lesson => !lesson.visited);
      if (!nextLesson) {
        console.log('[GuitareoDownloader] All lessons have been visited.');
        return false;
      }
      
      // Navigate to this lesson
      return this.navigateToLesson(nextLesson.index);
    },
    
    /**
     * Download a video using its Vimeo ID
     * @param {string} vimeoId - The Vimeo ID of the video
     * @param {string} [customFilename] - Optional custom filename
     * @returns {Promise<boolean>} Whether the download was successful
     */
    downloadWithVimeoId: async function(vimeoId, customFilename) {
      if (!vimeoId) {
        console.error('[GuitareoDownloader] No Vimeo ID provided');
        return false;
      }
      
      console.log(`[GuitareoDownloader] Fetching video info for Vimeo ID: ${vimeoId}`);
      
      try {
        // Get the Vimeo config
        const response = await fetch(`https://player.vimeo.com/video/${vimeoId}/config`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Get the highest quality progressive download URL
        const files = data.request.files.progressive;
        if (!files || files.length === 0) {
          throw new Error('No progressive download files found in Vimeo response');
        }
        
        const highestQuality = files.sort((a, b) => b.width - a.width)[0];
        
        if (!highestQuality || !highestQuality.url) {
          throw new Error('Could not find a downloadable video URL');
        }
        
        this.log('Found highest quality video:', highestQuality);
        
        // Create filename
        const filename = customFilename || `guitareo-vimeo-${vimeoId}.mp4`;
        
        // Download the video
        const a = document.createElement('a');
        a.href = highestQuality.url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Remove the link after a short delay
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
        
        // Record this download
        this.downloaded.push({
          vimeoId: vimeoId,
          url: highestQuality.url,
          filename: filename,
          quality: `${highestQuality.width}x${highestQuality.height}`,
          date: new Date().toISOString()
        });
        
        console.log(`[GuitareoDownloader] Started download of "${filename}" (${highestQuality.width}x${highestQuality.height})`);
        return true;
      } catch (error) {
        console.error(`[GuitareoDownloader] Error downloading video with ID ${vimeoId}:`, error);
        return false;
      }
    },
    
    /**
     * Go back to the method page
     * @returns {boolean} Whether navigation was successful
     */
    goToMethodPage: function() {
      try {
        console.log('[GuitareoDownloader] Navigating back to method page...');
        window.location.href = 'https://www.musora.com/guitareo/method/guitareo-method/333652';
        return true;
      } catch (error) {
        console.error('[GuitareoDownloader] Error navigating to method page:', error);
        return false;
      }
    },
    
    /**
     * Show download statistics and progress
     * @returns {Object} Statistics about downloads
     */
    showStats: function() {
      const stats = {
        totalLessons: this.lessons.length,
        visitedLessons: this.lessons.filter(l => l.visited).length,
        downloadedVideos: this.downloaded.length,
        remainingLessons: this.lessons.filter(l => !l.visited).length
      };
      
      console.log('[GuitareoDownloader] Download Statistics:');
      console.log(`  Total lessons found: ${stats.totalLessons}`);
      console.log(`  Lessons visited: ${stats.visitedLessons}`);
      console.log(`  Videos downloaded: ${stats.downloadedVideos}`);
      console.log(`  Remaining lessons: ${stats.remainingLessons}`);
      
      if (stats.downloadedVideos > 0) {
        console.log('[GuitareoDownloader] Downloaded videos:');
        this.downloaded.forEach((video, idx) => {
          console.log(`  ${idx + 1}. ${video.filename}`);
        });
      }
      
      return stats;
    },
    
    /**
     * Reset the downloader (clear lesson states and downloads)
     */
    reset: function() {
      this.lessons.forEach(lesson => {
        lesson.visited = false;
        lesson.downloaded = false;
      });
      this.downloaded = [];
      console.log('[GuitareoDownloader] Downloader has been reset');
    },
    
    /**
     * Display help information
     */
    help: function() {
      console.log(`
===============================
GUITAREO VIDEO DOWNLOADER HELP
===============================

Available methods:

1. findLessonLinks()
   Scans the current page for lesson cards and stores them

2. downloadCurrentVideo([customFilename])
   Downloads the video currently playing on the page

3. navigateToNextLesson()
   Navigates to the next unvisited lesson

4. navigateToLesson(index)
   Navigates to a specific lesson by its index

5. downloadWithVimeoId(vimeoId, [customFilename])
   Downloads a video using its Vimeo ID directly

6. goToMethodPage()
   Navigates back to the main method page

7. showStats()
   Shows statistics about found lessons and downloads

8. reset()
   Resets the state of the downloader

9. setDebugMode(enabled)
   Enables or disables debug logging

10. help()
    Shows this help message

WORKFLOW FOR DOWNLOADING ALL VIDEOS:
1. Navigate to: https://www.musora.com/guitareo/method/guitareo-method/333652
2. Run: GuitareoDownloader.findLessonLinks()
3. For each lesson:
   a. Run: GuitareoDownloader.navigateToNextLesson()
   b. Wait for the video to load
   c. Run: GuitareoDownloader.downloadCurrentVideo()
   d. Run: GuitareoDownloader.goToMethodPage()
   e. Repeat until all lessons are visited
`);
    }
  };
  
  // Initialize the downloader
  console.log(`
===============================
GUITAREO VIDEO DOWNLOADER
===============================

The GuitareoDownloader has been set up! Run GuitareoDownloader.help() to see available commands.

Quick start:
1. Make sure you're on the Guitareo Method page
2. Run: GuitareoDownloader.findLessonLinks()
3. Run: GuitareoDownloader.navigateToNextLesson()
4. Once the video loads, run: GuitareoDownloader.downloadCurrentVideo()
5. Run: GuitareoDownloader.goToMethodPage()
6. Repeat steps 3-5 for each lesson
`);
  
  // Automatically detect page type and take appropriate action
  if (window.location.href.includes('/method/')) {
    console.log('[GuitareoDownloader] Method page detected. Run findLessonLinks() to begin.');
  } else if (document.querySelector('video')) {
    console.log('[GuitareoDownloader] Video detected on this page. Run downloadCurrentVideo() to download it.');
  }
})();
