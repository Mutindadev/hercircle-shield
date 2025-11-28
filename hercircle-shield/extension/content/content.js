// HerCircle Shield Content Script
// Monitors page content for GBV and harassment in real-time

console.log('HerCircle Shield content script loaded');

// Configuration
const DETECTION_DELAY = 1000; // Debounce delay for detection
const PLATFORMS = {
  'twitter.com': 'Twitter',
  'x.com': 'Twitter',
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'linkedin.com': 'LinkedIn',
  'tiktok.com': 'TikTok',
  'whatsapp.com': 'WhatsApp',
  'mail.google.com': 'Gmail'
};

let detectionQueue = [];
let detectionTimer = null;
let settings = {};

// Initialize
async function init() {
  // Get settings from storage
  const result = await chrome.storage.local.get(['settings']);
  settings = result.settings || {};
  
  // Detect current platform
  const platform = detectPlatform();
  console.log('Platform detected:', platform);
  
  // Set up observers based on platform
  if (platform) {
    observeContent(platform);
  }
  
  // Listen for messages from background
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Detect which platform we're on
function detectPlatform() {
  const hostname = window.location.hostname;
  for (const [domain, name] of Object.entries(PLATFORMS)) {
    if (hostname.includes(domain)) {
      return name;
    }
  }
  return null;
}

// Observe content changes on the page
function observeContent(platform) {
  // Platform-specific selectors
  const selectors = getPlatformSelectors(platform);
  
  // Set up mutation observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          checkElement(node, selectors);
        }
      });
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also check existing content
  checkExistingContent(selectors);
}

// Get platform-specific content selectors
function getPlatformSelectors(platform) {
  const selectorMap = {
    'Twitter': {
      posts: '[data-testid="tweet"]',
      text: '[data-testid="tweetText"]',
      comments: '[data-testid="reply"]'
    },
    'Facebook': {
      posts: '[role="article"]',
      text: '[data-ad-preview="message"]',
      comments: '[role="article"] [dir="auto"]'
    },
    'Instagram': {
      posts: 'article',
      text: 'article span',
      comments: 'ul li span'
    },
    'LinkedIn': {
      posts: '.feed-shared-update-v2',
      text: '.feed-shared-text',
      comments: '.comments-comment-item'
    },
    'TikTok': {
      posts: '[data-e2e="browse-video"]',
      text: '[data-e2e="browse-video-desc"]',
      comments: '[data-e2e="comment-item"]'
    },
    'WhatsApp': {
      posts: '[data-testid="msg-container"]',
      text: '.copyable-text',
      comments: '.copyable-text'
    },
    'Gmail': {
      posts: '.a3s',
      text: '.a3s',
      comments: '.a3s'
    }
  };
  
  return selectorMap[platform] || { posts: 'div', text: 'p', comments: 'div' };
}

// Check existing content on page load
function checkExistingContent(selectors) {
  const elements = document.querySelectorAll(selectors.text);
  elements.forEach(element => {
    const text = element.textContent?.trim();
    if (text && text.length > 10) {
      queueDetection(text, element);
    }
  });
}

// Check a specific element
function checkElement(element, selectors) {
  // Check if element matches text selector
  if (element.matches && element.matches(selectors.text)) {
    const text = element.textContent?.trim();
    if (text && text.length > 10) {
      queueDetection(text, element);
    }
  }
  
  // Check children
  const textElements = element.querySelectorAll(selectors.text);
  textElements.forEach(el => {
    const text = el.textContent?.trim();
    if (text && text.length > 10) {
      queueDetection(text, el);
    }
  });
}

// Queue content for detection (with debouncing)
function queueDetection(text, element) {
  detectionQueue.push({ text, element });
  
  // Clear existing timer
  if (detectionTimer) {
    clearTimeout(detectionTimer);
  }
  
  // Set new timer
  detectionTimer = setTimeout(() => {
    processDetectionQueue();
  }, DETECTION_DELAY);
}

// Process queued detections
async function processDetectionQueue() {
  if (detectionQueue.length === 0) return;
  
  // Get unique texts
  const uniqueTexts = [...new Set(detectionQueue.map(item => item.text))];
  
  // Send to background for detection
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'DETECT_CONTENT',
      data: uniqueTexts[0] // For now, detect first item
    });
    
    if (response.isHarmful) {
      // Find all elements with this text and mark them
      detectionQueue.forEach(item => {
        if (item.text === uniqueTexts[0]) {
          markAsHarmful(item.element, response);
        }
      });
    }
  } catch (error) {
    console.error('Detection error:', error);
  }
  
  // Clear queue
  detectionQueue = [];
}

// Mark element as containing harmful content
function markAsHarmful(element, detectionResult) {
  if (!element || element.dataset.herCircleMarked) return;
  
  element.dataset.herCircleMarked = 'true';
  
  // Add visual indicator
  element.style.border = '2px solid #F44336';
  element.style.borderRadius = '4px';
  element.style.padding = '8px';
  element.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
  
  // Add warning banner
  const banner = document.createElement('div');
  banner.className = 'hercircle-warning-banner';
  banner.innerHTML = `
    <div style="background: #F44336; color: white; padding: 8px; margin-bottom: 8px; border-radius: 4px; font-size: 14px;">
      ⚠️ <strong>Potential ${detectionResult.severity.toUpperCase()} Threat Detected</strong>
      <br>
      <small>${detectionResult.detectionType.join(', ')}</small>
      <div style="margin-top: 8px;">
        <button class="hercircle-btn-hide" style="background: white; color: #F44336; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px;">Hide Content</button>
        <button class="hercircle-btn-report" style="background: white; color: #F44336; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px;">Report</button>
        <button class="hercircle-btn-dismiss" style="background: transparent; color: white; border: 1px solid white; padding: 4px 12px; border-radius: 4px; cursor: pointer;">Not Harmful</button>
      </div>
    </div>
  `;
  
  element.parentNode?.insertBefore(banner, element);
  
  // Add event listeners
  banner.querySelector('.hercircle-btn-hide')?.addEventListener('click', () => {
    element.style.display = 'none';
    banner.remove();
    updateBlockedCount();
  });
  
  banner.querySelector('.hercircle-btn-report')?.addEventListener('click', () => {
    reportContent(element.textContent, detectionResult);
  });
  
  banner.querySelector('.hercircle-btn-dismiss')?.addEventListener('click', () => {
    banner.remove();
    element.style.border = 'none';
    element.style.backgroundColor = 'transparent';
  });
  
  // Auto-hide if setting is enabled
  if (settings.autoHide) {
    setTimeout(() => {
      element.style.filter = 'blur(10px)';
    }, 500);
  }
}

// Report harmful content
async function reportContent(text, detectionResult) {
  try {
    await chrome.runtime.sendMessage({
      type: 'CAPTURE_EVIDENCE',
      data: {
        url: window.location.href,
        platform: detectPlatform(),
        description: `${detectionResult.detectionType.join(', ')} - ${text.substring(0, 100)}`
      }
    });
    
    alert('Content reported and evidence captured.');
  } catch (error) {
    console.error('Report error:', error);
  }
}

// Update blocked count
async function updateBlockedCount() {
  const { blockedCount = 0 } = await chrome.storage.local.get(['blockedCount']);
  await chrome.storage.local.set({ blockedCount: blockedCount + 1 });
}

// Handle messages from background
function handleMessage(message, sender, sendResponse) {
  if (message.type === 'THREAT_DETECTED') {
    console.log('Threat detected:', message.data);
    // Additional handling if needed
  }
  sendResponse({ received: true });
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
