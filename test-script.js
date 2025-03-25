/**
 * Test script for Guitareo Video Downloader
 * This script helps verify that the downloader is working correctly
 */

(function() {
  // Check if GuitareoDownloader is already loaded
  if (window.GuitareoDownloader) {
    console.log('GuitareoDownloader is already loaded. Running tests...');
    runTests();
    return;
  }
  
  // Function to load the main script
  function loadMainScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      
      // Try to load from local file first
      script.src = './guitareo-downloader.js';
      script.onload = function() {
        console.log('Loaded guitareo-downloader.js from local file.');
        resolve();
      };
      script.onerror = function() {
        console.log('Failed to load from local file. Trying GitHub...');
        
        // Try to load from GitHub as fallback
        script.src = 'https://raw.githubusercontent.com/nimishchaudhari/guitareo-downloader/main/guitareo-downloader.js';
        script.onload = function() {
          console.log('Loaded guitareo-downloader.js from GitHub.');
          resolve();
        };
        script.onerror = function() {
          reject(new Error('Failed to load guitareo-downloader.js'));
        };
        
        document.body.appendChild(script);
      };
      
      document.body.appendChild(script);
    });
  }
  
  // Run tests on the GuitareoDownloader
  function runTests() {
    console.log('=== GUITAREO DOWNLOADER TEST RESULTS ===');
    
    // Test 1: Verify object exists
    if (typeof window.GuitareoDownloader === 'object') {
      console.log('✓ Test 1: GuitareoDownloader object exists');
    } else {
      console.error('✗ Test 1: GuitareoDownloader object does NOT exist');
      return;
    }
    
    // Test 2: Verify methods exist
    const requiredMethods = [
      'findLessonLinks',
      'downloadCurrentVideo',
      'navigateToNextLesson',
      'navigateToLesson',
      'downloadWithVimeoId',
      'goToMethodPage',
      'showStats',
      'reset',
      'help'
    ];
    
    const missingMethods = requiredMethods.filter(method => 
      typeof window.GuitareoDownloader[method] !== 'function'
    );
    
    if (missingMethods.length === 0) {
      console.log('✓ Test 2: All required methods exist');
    } else {
      console.error('✗ Test 2: Missing methods:', missingMethods.join(', '));
    }
    
    // Test 3: Check if we're on a Guitareo page
    if (window.location.href.includes('musora.com/guitareo')) {
      console.log('✓ Test 3: Currently on a Guitareo page');
      
      // Test 4: Check for video element
      const videoElement = document.querySelector('video');
      if (videoElement) {
        console.log('✓ Test 4: Video element found on page');
        
        if (videoElement.currentSrc) {
          console.log('✓ Test 5: Video has source URL:', videoElement.currentSrc.substring(0, 50) + '...');
        } else {
          console.warn('⚠ Test 5: Video element has no source URL');
        }
      } else {
        console.warn('⚠ Test 4: No video element found on current page');
      }
      
      // Test 5: Check if on method page
      if (window.location.href.includes('/method/')) {
        console.log('✓ Test 6: Currently on a method page');
        console.log('  You can run GuitareoDownloader.findLessonLinks() now');
      } else {
        console.log('⚠ Test 6: Not on a method page');
        console.log('  Navigate to https://www.musora.com/guitareo/method/guitareo-method/333652 to find lessons');
      }
    } else {
      console.warn('⚠ Test 3: Not on a Guitareo page');
      console.log('  Navigate to https://www.musora.com/guitareo to use this tool');
    }
    
    console.log('=== TEST COMPLETE ===');
    console.log('Use GuitareoDownloader.help() to see available commands');
  }
  
  // Load the script and run tests
  loadMainScript()
    .then(runTests)
    .catch(error => {
      console.error('Error during testing:', error);
    });
})();
